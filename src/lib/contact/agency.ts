import type { Locale } from "@/lib/locale";

/**
 * The travel agency officially authorised by the Embassy for visa application
 * processing. Shared by the contact form notice and the visa auto-reply email
 * so both stay in step with the details published on the Visa Services page.
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

type AgencyCopy = {
  noticeTitle: string;
  requirementsLine: string;
  requirementsLink: string;
  agencyLine: (agencyName: string) => string;
  servicesTitle: string;
  services: string[];
  contactTitle: string;
  phoneWhatsappLabel: string;
  uanLabel: string;
  websiteLabel: string;
};

export function getAgencyCopy(locale: Locale): AgencyCopy {
  if (locale === "ar") {
    return {
      noticeTitle: "التقديم على التأشيرة",
      requirementsLine: "جميع المستندات المطلوبة لهذه الفئة منشورة على صفحة خدمات التأشيرات في موقعنا.",
      requirementsLink: "عرض متطلبات التأشيرة",
      agencyLine: (agencyName: string) =>
        `لتقديم طلبك، توصي السفارة بشركة ${agencyName}، وهي وكالة معتمدة رسمياً من السفارة لإجراءات التأشيرات والتصديق على المستندات.`,
      servicesTitle: "الخدمات",
      services: ["التقديم والاستلام الرسمي للتأشيرة", "خدمات تصديق المستندات"],
      contactTitle: "للتواصل مع الوكالة المعتمدة",
      phoneWhatsappLabel: "الهاتف/واتساب",
      uanLabel: "الرقم الموحد",
      websiteLabel: "الموقع الإلكتروني",
    };
  }

  return {
    noticeTitle: "Applying for a Visa",
    requirementsLine:
      "The full document checklist for this category is published on our Visa Services page.",
    requirementsLink: "View visa requirements",
    agencyLine: (agencyName: string) =>
      `To submit an application, the Embassy recommends ${agencyName}, an agency officially authorised by the Embassy for visa application processing and document attestation.`,
    servicesTitle: "Services",
    services: ["Visa Application Submission & Collection", "Document Attestation Services"],
    contactTitle: "Contact the authorised agency",
    phoneWhatsappLabel: "Phone / WhatsApp",
    uanLabel: "UAN",
    websiteLabel: "Website",
  };
}
