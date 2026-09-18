import type { Locale } from "@/lib/locale";
import type { DeflectedService } from "@/lib/contact/categories";

/**
 * The travel agency officially authorised by the Embassy for visa application
 * processing and document attestation. Shared by the contact form notice and
 * the auto-reply email so both stay in step with the details published on the
 * Visa Services page.
 */
export const AUTHORISED_AGENCY = {
  name: "Crown International Travels Pvt. Ltd.",
  websiteUrl: "https://www.crownintltravels.com/",
  phoneDisplay: "+92 313 5000666",
  phoneTel: "+923135000666",
  whatsappUrl: "https://wa.me/923135000666",
  uanDisplay: "+92 51 111 143 111",
  uanTel: "+9251111143111",
} as const;

/** Site path (without locale prefix) where each deflected service's requirements are published. */
export const SERVICE_INFO_PATH: Record<DeflectedService, string> = {
  visa: "/visas",
  attestation: "/consular",
};

type AgencyCopy = {
  noticeTitle: string;
  requirementsLine: string;
  requirementsLink: string;
  agencyLine: (agencyName: string) => string;
  contactTitle: string;
  phoneWhatsappLabel: string;
  uanLabel: string;
  websiteLabel: string;
};

export function getAgencyCopy(locale: Locale, service: DeflectedService): AgencyCopy {
  if (locale === "ar") {
    const shared = {
      agencyLine: (agencyName: string) =>
        `لتقديم طلبك، توصي السفارة بشركة ${agencyName}، وهي وكالة معتمدة رسمياً من السفارة لإجراءات التأشيرات والتصديق على المستندات.`,
      contactTitle: "للتواصل مع الوكالة المعتمدة",
      phoneWhatsappLabel: "الهاتف/واتساب",
      uanLabel: "الرقم الموحد",
      websiteLabel: "الموقع الإلكتروني",
    };

    if (service === "attestation") {
      return {
        ...shared,
        noticeTitle: "تصديق وتوثيق المستندات",
        requirementsLine:
          "المستندات المطلوبة وخطوات التوثيق، بما في ذلك التصديق المسبق من وزارة الخارجية الباكستانية، منشورة على صفحة الشؤون القنصلية في موقعنا.",
        requirementsLink: "عرض متطلبات التصديق",
      };
    }

    return {
      ...shared,
      noticeTitle: "التقديم على التأشيرة",
      requirementsLine: "جميع المستندات المطلوبة لهذه الفئة منشورة على صفحة خدمات التأشيرات في موقعنا.",
      requirementsLink: "عرض متطلبات التأشيرة",
    };
  }

  const shared = {
    agencyLine: (agencyName: string) =>
      `To submit an application, the Embassy recommends ${agencyName}, an agency officially authorised by the Embassy for visa application processing and document attestation.`,
    contactTitle: "Contact the authorised agency",
    phoneWhatsappLabel: "Phone / WhatsApp",
    uanLabel: "UAN",
    websiteLabel: "Website",
  };

  if (service === "attestation") {
    return {
      ...shared,
      noticeTitle: "Document Attestation & Legalization",
      requirementsLine:
        "The required documents and legalization steps, including prior attestation by the Ministry of Foreign Affairs of Pakistan, are published on our Consular Affairs page.",
      requirementsLink: "View attestation requirements",
    };
  }

  return {
    ...shared,
    noticeTitle: "Applying for a Visa",
    requirementsLine:
      "The full document checklist for this category is published on our Visa Services page.",
    requirementsLink: "View visa requirements",
  };
}
