import type { Locale } from "@/lib/locale";
import { AUTHORISED_AGENCY, getAgencyCopy } from "@/lib/contact/agency";

type VisaAutoReplyTemplateInput = {
  locale: Locale;
  embassyName: string;
  websiteUrl: string;
  embassyEmail: string;
  recipientName: string;
  categoryLabel: string;
  subject: string;
  submittedAt: Date;
};

type VisaAutoReplyTemplateResult = {
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

/**
 * ---------------------------------------------------------------------------
 * AUTO-REPLY COPY
 *
 * The only block to edit when changing what visa applicants receive.
 * `paragraphs` renders one <p> per entry in the HTML mail and one
 * blank-line-separated block in the plain-text mail. Agency name and contact
 * details come from `@/lib/contact/agency` so the email, the contact form
 * notice and the Visa Services page cannot drift apart.
 * ---------------------------------------------------------------------------
 */
function getCopy(locale: Locale) {
  if (locale === "ar") {
    return {
      banner: "سفارة لبنان - إسلام آباد",
      heading: "شكراً لتواصلك معنا",
      greeting: (name: string) => `عزيزي/عزيزتي ${name}،`,
      paragraphs: [
        "شكراً لتواصلك مع سفارة لبنان في إسلام آباد. لقد تسلمنا استفسارك حول التأشيرة.",
        "جميع المستندات المطلوبة وإجراءات التقديم منشورة بالكامل على صفحة خدمات التأشيرات في موقعنا الإلكتروني. يرجى مراجعتها قبل التقديم.",
        "يرجى ملاحظة أن هذه رسالة تأكيد تلقائية ولا تشكل قراراً بشأن طلبك.",
      ],
      detailsTitle: "ملخص استفسارك",
      categoryLabel: "الفئة",
      subjectLabel: "الموضوع",
      submittedAtLabel: "تاريخ الإرسال (UTC)",
      ctaLabel: "عرض متطلبات التأشيرة",
      footerContact: "لأي استفسار إضافي، يرجى الرد على هذه الرسالة أو مراسلتنا على",
      footerAuto: "هذه رسالة تلقائية أُرسلت من نموذج التواصل على الموقع الإلكتروني للسفارة.",
      preview: "متطلبات التأشيرة وتفاصيل الوكالة المعتمدة.",
      subjectLine: "استفسار التأشيرة - المتطلبات وجهة التقديم المعتمدة",
    };
  }

  return {
    banner: "Embassy of Lebanon - Islamabad",
    heading: "Thank You for Contacting Us",
    greeting: (name: string) => `Dear ${name},`,
    paragraphs: [
      "Thank you for contacting the Embassy of Lebanon in Islamabad. We have received your visa inquiry.",
      "The complete document requirements and application procedure are published on the Visa Services page of our website. Please review them before applying.",
      "Please note that this is an automated acknowledgement and does not constitute a decision on your application.",
    ],
    detailsTitle: "Summary of Your Inquiry",
    categoryLabel: "Category",
    subjectLabel: "Subject",
    submittedAtLabel: "Submitted At (UTC)",
    ctaLabel: "View Visa Requirements",
    footerContact: "For any further questions, please reply to this email or write to us at",
    footerAuto: "This is an automated message sent from the embassy website contact form.",
    preview: "Visa requirements and authorised agency details.",
    subjectLine: "Your visa inquiry - requirements and authorised agency",
  };
}

export function buildVisaAutoReplyTemplate(input: VisaAutoReplyTemplateInput): VisaAutoReplyTemplateResult {
  const copy = getCopy(input.locale);
  const isRtl = input.locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const align = isRtl ? "right" : "left";
  const valueAlign = isRtl ? "left" : "right";
  const submittedAtUtc = formatUtcDate(input.submittedAt);
  const visaUrl = new URL(`/${input.locale}/visas`, input.websiteUrl).toString();

  const safeEmbassyName = escapeHtml(input.embassyName);
  const safeWebsiteUrl = escapeHtml(input.websiteUrl);
  const safeEmbassyEmail = escapeHtml(input.embassyEmail);
  const safeCategory = escapeHtml(input.categoryLabel);
  const safeSubject = escapeHtml(input.subject);
  const safeVisaUrl = escapeHtml(visaUrl);
  const preheader = escapeHtml(copy.preview);

  const agency = getAgencyCopy(input.locale);
  const safeAgencyName = escapeHtml(AUTHORISED_AGENCY.name);
  const safeAgencyUrl = escapeHtml(AUTHORISED_AGENCY.websiteUrl);
  const safeAgencyWhatsapp = escapeHtml(AUTHORISED_AGENCY.whatsappUrl);

  const subjectLine = copy.subjectLine;

  const text = [
    copy.greeting(input.recipientName),
    "",
    ...copy.paragraphs.flatMap((paragraph) => [paragraph, ""]),
    `${copy.detailsTitle}:`,
    `${copy.categoryLabel}: ${input.categoryLabel}`,
    `${copy.subjectLabel}: ${input.subject}`,
    `${copy.submittedAtLabel}: ${submittedAtUtc} UTC`,
    "",
    `${agency.noticeTitle}:`,
    agency.agencyLine(AUTHORISED_AGENCY.name),
    `${agency.phoneWhatsappLabel}: ${AUTHORISED_AGENCY.phoneDisplay}`,
    `${agency.uanLabel}: ${AUTHORISED_AGENCY.uanDisplay}`,
    `${agency.websiteLabel}: ${AUTHORISED_AGENCY.websiteUrl}`,
    "",
    `${copy.ctaLabel}: ${visaUrl}`,
    "",
    `${copy.footerContact} ${input.embassyEmail}`,
    "",
    input.embassyName,
    input.websiteUrl,
    "",
    copy.footerAuto,
  ].join("\n");

  const paragraphsHtml = copy.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#111827;">${escapeHtml(paragraph)}</p>`,
    )
    .join("\n                ");

  const detailRow = (label: string, value: string) => `<tr>
                    <td style="padding:0 0 8px;font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                      ${escapeHtml(label)}
                    </td>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#111827;" align="${valueAlign}">
                      ${value}
                    </td>
                  </tr>`;

  const html = `<!doctype html>
<html lang="${input.locale}" dir="${dir}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subjectLine)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111827;" dir="${dir}">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">
      ${preheader}
    </span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f5f7;padding:24px 8px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;" dir="${dir}">
            <tr>
              <td style="padding:22px 28px;background:#cf102d;text-align:${align};">
                <div style="font-size:11px;line-height:1.4;color:#ffd4dd;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">
                  ${escapeHtml(copy.banner)}
                </div>
                <div style="font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;margin-top:6px;">
                  ${escapeHtml(copy.heading)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 4px;text-align:${align};">
                <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#111827;font-weight:700;">
                  ${escapeHtml(copy.greeting(input.recipientName))}
                </p>
                ${paragraphsHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0;">
                <div style="height:4px;background:#00a651;border-radius:999px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0;text-align:${align};">
                <div style="font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                  ${escapeHtml(copy.detailsTitle)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="${dir}">
                  ${detailRow(copy.categoryLabel, safeCategory)}
                  ${detailRow(copy.subjectLabel, safeSubject)}
                  ${detailRow(copy.submittedAtLabel, `${escapeHtml(submittedAtUtc)} UTC`)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="${dir}" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                  <tr>
                    <td style="padding:16px 18px;text-align:${align};">
                      <div style="font-size:12px;line-height:1.4;font-weight:700;color:#cf102d;text-transform:uppercase;letter-spacing:0.08em;">
                        ${escapeHtml(agency.noticeTitle)}
                      </div>
                      <div style="font-size:15px;line-height:1.7;color:#111827;margin-top:8px;">
                        ${escapeHtml(agency.agencyLine(AUTHORISED_AGENCY.name))}
                      </div>
                      <div style="font-size:12px;line-height:1.4;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:14px;">
                        ${escapeHtml(agency.contactTitle)}
                      </div>
                      <div style="font-size:14px;line-height:1.9;color:#111827;margin-top:6px;">
                        ${escapeHtml(agency.phoneWhatsappLabel)}:
                        <a href="${safeAgencyWhatsapp}" style="color:#cf102d;text-decoration:underline;">${escapeHtml(AUTHORISED_AGENCY.phoneDisplay)}</a><br />
                        ${escapeHtml(agency.uanLabel)}:
                        <a href="tel:${escapeHtml(AUTHORISED_AGENCY.uanTel)}" style="color:#cf102d;text-decoration:underline;">${escapeHtml(AUTHORISED_AGENCY.uanDisplay)}</a><br />
                        ${escapeHtml(agency.websiteLabel)}:
                        <a href="${safeAgencyUrl}" style="color:#cf102d;text-decoration:underline;">${safeAgencyName}</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0;text-align:${align};">
                <a href="${safeVisaUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;line-height:1.2;font-weight:700;border-radius:8px;padding:11px 16px;">
                  ${escapeHtml(copy.ctaLabel)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 24px;font-size:12px;line-height:1.6;color:#6b7280;text-align:${align};">
                ${escapeHtml(copy.footerContact)}
                <a href="mailto:${safeEmbassyEmail}" style="color:#cf102d;text-decoration:underline;">${safeEmbassyEmail}</a><br /><br />
                <strong style="color:#111827;">${safeEmbassyName}</strong><br />
                <a href="${safeWebsiteUrl}" style="color:#cf102d;text-decoration:underline;">${safeWebsiteUrl}</a><br /><br />
                ${escapeHtml(copy.footerAuto)}
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
