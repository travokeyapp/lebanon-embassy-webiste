import type { Locale } from "@/lib/locale";

type ContactEmailTemplateInput = {
  locale: Locale;
  embassyName: string;
  websiteUrl: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  submittedAt: Date;
};

type ContactEmailTemplateResult = {
  subjectLine: string;
  html: string;
  text: string;
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatUtcDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(date);
}

function compactEmail(email: string): string {
  return email.replace(/\s+/g, "");
}

function getCopy(locale: Locale) {
  if (locale === "ar") {
    return {
      banner: "Embassy Contact Form",
      heading: "New Inquiry Received",
      subheading: "A new inquiry was submitted from the website contact form.",
      senderLabel: "Sender",
      emailLabel: "Email",
      subjectLabel: "Subject",
      submittedAtLabel: "Submitted At (UTC)",
      messageLabel: "Message",
      replyButton: "Reply to Sender",
      footer: "This message was generated automatically from the embassy website contact form.",
      preview: "A new inquiry was submitted from the website contact form.",
      subjectPrefix: "[Embassy Contact]",
    };
  }

  return {
    banner: "Embassy Contact Form",
    heading: "New Inquiry Received",
    subheading: "A new inquiry was submitted from the website contact form.",
    senderLabel: "Sender",
    emailLabel: "Email",
    subjectLabel: "Subject",
    submittedAtLabel: "Submitted At (UTC)",
    messageLabel: "Message",
    replyButton: "Reply to Sender",
    footer: "This message was generated automatically from the embassy website contact form.",
    preview: "A new inquiry was submitted from the website contact form.",
    subjectPrefix: "[Embassy Contact]",
  };
}

export function buildContactEmailTemplate(input: ContactEmailTemplateInput): ContactEmailTemplateResult {
  const copy = getCopy(input.locale);
  const submittedAtUtc = formatUtcDate(input.submittedAt);
  const safeEmbassyName = escapeHtml(input.embassyName);
  const safeWebsiteUrl = escapeHtml(input.websiteUrl);
  const safeName = escapeHtml(input.senderName);
  const safeEmail = escapeHtml(input.senderEmail);
  const safeSubject = escapeHtml(input.subject);
  const safeMessageHtml = escapeHtml(input.message).replace(/\n/g, "<br />");
  const preheader = escapeHtml(copy.preview);
  const replyToEmail = compactEmail(input.senderEmail);
  const replySubject = encodeURIComponent(`Re: ${input.subject}`);
  const replyHref = `mailto:${replyToEmail}?subject=${replySubject}`;

  const subjectLine = `${copy.subjectPrefix} ${input.subject}`;

  const text = [
    `${copy.heading}`,
    "",
    `${copy.senderLabel}: ${input.senderName}`,
    `${copy.emailLabel}: ${input.senderEmail}`,
    `${copy.subjectLabel}: ${input.subject}`,
    `${copy.submittedAtLabel}: ${submittedAtUtc} UTC`,
    "",
    `${copy.messageLabel}:`,
    input.message,
    "",
    `Website: ${input.websiteUrl}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subjectLine)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">
      ${preheader}
    </span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f5f7;padding:24px 8px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:22px 28px;background:#cf102d;">
                <div style="font-size:11px;line-height:1.4;color:#ffd4dd;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">
                  ${escapeHtml(copy.banner)}
                </div>
                <div style="font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;margin-top:6px;">
                  ${escapeHtml(copy.heading)}
                </div>
                <div style="font-size:14px;line-height:1.6;color:#ffe8ed;margin-top:8px;">
                  ${escapeHtml(copy.subheading)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding:0 0 8px;font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                      ${escapeHtml(copy.senderLabel)}
                    </td>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#111827;" align="right">
                      ${safeName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px;font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                      ${escapeHtml(copy.emailLabel)}
                    </td>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#111827;" align="right">
                      ${safeEmail}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px;font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                      ${escapeHtml(copy.subjectLabel)}
                    </td>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#111827;" align="right">
                      ${safeSubject}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px;font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                      ${escapeHtml(copy.submittedAtLabel)}
                    </td>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#111827;" align="right">
                      ${escapeHtml(submittedAtUtc)} UTC
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0;">
                <div style="height:4px;background:#00a651;border-radius:999px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0;">
                <div style="font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                  ${escapeHtml(copy.messageLabel)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 28px 0;">
                <div style="font-size:15px;line-height:1.7;color:#111827;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;">
                  ${safeMessageHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0;">
                <a href="${replyHref}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;line-height:1.2;font-weight:700;border-radius:8px;padding:11px 16px;">
                  ${escapeHtml(copy.replyButton)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 24px;font-size:12px;line-height:1.6;color:#6b7280;">
                ${escapeHtml(copy.footer)}<br />
                <a href="${safeWebsiteUrl}" style="color:#cf102d;text-decoration:underline;">${safeWebsiteUrl}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subjectLine,
    html,
    text,
  };
}
