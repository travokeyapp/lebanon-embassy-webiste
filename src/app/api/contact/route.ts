import { NextRequest, NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/locale";
import { buildContactEmailTemplate } from "@/lib/email/contact-template";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  locale: "en" | "ar";
};

const globalStore = globalThis as typeof globalThis & {
  __contactRateLimitStore?: Map<string, RateLimitEntry>;
};

const rateLimitStore = globalStore.__contactRateLimitStore ?? new Map<string, RateLimitEntry>();
if (!globalStore.__contactRateLimitStore) {
  globalStore.__contactRateLimitStore = rateLimitStore;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validate(payload: ContactPayload): string | null {
  if (payload.name.length < 2 || payload.name.length > 100) {
    return "Please enter a valid full name.";
  }
  if (!EMAIL_PATTERN.test(payload.email) || payload.email.length > 160) {
    return "Please enter a valid email address.";
  }
  if (payload.subject.length < 3 || payload.subject.length > 160) {
    return "Please enter a valid subject.";
  }
  if (payload.message.length < 10 || payload.message.length > 5000) {
    return "Please enter a message between 10 and 5000 characters.";
  }
  return null;
}

function buildFromHeader(fromName: string, fromEmail: string): string {
  const safeName = fromName.replace(/[<>"]/g, "").trim();
  return safeName ? `${safeName} <${fromEmail}>` : fromEmail;
}

function buildContactRedirect(request: NextRequest, locale: "en" | "ar", status: "success" | "error") {
  const url = new URL(`/${locale}/contact`, request.url);
  url.searchParams.set("contactStatus", status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isJsonRequest = contentType.includes("application/json");
  const expectsHtml = !isJsonRequest && (request.headers.get("accept") ?? "").includes("text/html");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (expectsHtml) {
      return buildContactRedirect(request, "en", "error");
    }
    return NextResponse.json({ message: "Contact service is not configured." }, { status: 503 });
  }

  let payload: ContactPayload;
  try {
    if (isJsonRequest) {
      const body = (await request.json()) as Record<string, unknown>;
      payload = {
        name: asText(body.name),
        email: asText(body.email),
        subject: asText(body.subject),
        message: asText(body.message),
        website: asText(body.website),
        locale: normalizeLocale(asText(body.locale)),
      };
    } else {
      const formData = await request.formData();
      payload = {
        name: asText(formData.get("name")),
        email: asText(formData.get("email")),
        subject: asText(formData.get("subject")),
        message: asText(formData.get("message")),
        website: asText(formData.get("website")),
        locale: normalizeLocale(asText(formData.get("locale"))),
      };
    }
  } catch {
    if (expectsHtml) {
      return buildContactRedirect(request, "en", "error");
    }
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  // Honeypot trap: behave like success for bots to reduce retries.
  if (payload.website) {
    if (expectsHtml) {
      return buildContactRedirect(request, payload.locale, "success");
    }
    return NextResponse.json({ message: "Your message has been sent successfully." });
  }

  const validationError = validate(payload);
  if (validationError) {
    if (expectsHtml) {
      return buildContactRedirect(request, payload.locale, "error");
    }
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    if (expectsHtml) {
      return buildContactRedirect(request, payload.locale, "error");
    }
    return NextResponse.json(
      { message: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const toEmail = process.env.CONTACT_TO_EMAIL ?? "lebanonembassypakistan@gmail.com";
  const fromName = process.env.CONTACT_FROM_NAME ?? "Embassy of Lebanon Islamabad";
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "noreply@lebanonembassy.pk";
  const websiteUrl = process.env.CONTACT_WEBSITE_URL ?? "https://www.lebanonembassy.pk/";
  const emailTemplate = buildContactEmailTemplate({
    locale: payload.locale,
    embassyName: fromName,
    websiteUrl,
    senderName: payload.name,
    senderEmail: payload.email,
    subject: payload.subject,
    message: payload.message,
    submittedAt: new Date(),
  });

  try {
    const resendResponse = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: buildFromHeader(fromName, fromEmail),
        to: [toEmail],
        reply_to: payload.email,
        subject: emailTemplate.subjectLine,
        text: emailTemplate.text,
        html: emailTemplate.html,
      }),
      cache: "no-store",
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error("Resend send failure:", resendResponse.status, errorBody);
      if (expectsHtml) {
        return buildContactRedirect(request, payload.locale, "error");
      }
      return NextResponse.json(
        { message: "Unable to send your message right now. Please try again later." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Resend request error:", error);
    if (expectsHtml) {
      return buildContactRedirect(request, payload.locale, "error");
    }
    return NextResponse.json(
      { message: "Unable to send your message right now. Please try again later." },
      { status: 502 },
    );
  }

  if (expectsHtml) {
    return buildContactRedirect(request, payload.locale, "success");
  }
  return NextResponse.json({ message: "Your message has been sent successfully." });
}
