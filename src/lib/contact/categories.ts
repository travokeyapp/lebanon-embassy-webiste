import type { Locale } from "@/lib/locale";

export type ContactCategoryGroupId = "visa" | "consular" | "other";

export type ContactCategory = {
  id: string;
  group: ContactCategoryGroupId;
  en: string;
  ar: string;
  /**
   * When true, the submitter receives an automated acknowledgement email in
   * addition to the notification sent to the embassy inbox.
   */
  autoReply: boolean;
};

export type ContactCategoryGroup = {
  id: ContactCategoryGroupId;
  en: string;
  ar: string;
};

export const CONTACT_CATEGORY_GROUPS: ContactCategoryGroup[] = [
  { id: "visa", en: "Visa Services", ar: "خدمات التأشيرات" },
  { id: "consular", en: "Consular & Civil Affairs", ar: "الشؤون القنصلية والأحوال الشخصية" },
  { id: "other", en: "Other", ar: "أخرى" },
];

export const CONTACT_CATEGORIES: ContactCategory[] = [
  { id: "visa-tourist", group: "visa", en: "Tourist Visa", ar: "تأشيرة سياحية", autoReply: true },
  { id: "visa-business", group: "visa", en: "Business Visa", ar: "تأشيرة أعمال", autoReply: true },
  { id: "visa-family", group: "visa", en: "Family Visit Visa", ar: "زيارة عائلية", autoReply: true },
  { id: "visa-medical", group: "visa", en: "Medical Treatment Visa", ar: "زيارة للعلاج الطبي", autoReply: true },
  { id: "visa-training", group: "visa", en: "Training Course Visa", ar: "زيارة لحضور دورة تدريبية", autoReply: true },
  { id: "visa-transit", group: "visa", en: "Transit Visa", ar: "تأشيرة عبور", autoReply: true },
  { id: "visa-study", group: "visa", en: "Study Visa", ar: "زيارة للدراسة", autoReply: true },
  { id: "visa-general", group: "visa", en: "General Visa Inquiry", ar: "استفسار عام حول التأشيرات", autoReply: true },

  { id: "passport-renewal", group: "consular", en: "Passport Renewal", ar: "تجديد جواز السفر", autoReply: false },
  {
    id: "passport-travel-document",
    group: "consular",
    en: "Emergency Travel Document (Laissez-Passer)",
    ar: "وثيقة سفر طارئة (جواز مرور)",
    autoReply: false,
  },
  { id: "passport-lost", group: "consular", en: "Lost or Stolen Passport", ar: "جواز سفر مفقود أو مسروق", autoReply: false },
  { id: "civil-birth", group: "consular", en: "Birth Registration", ar: "تسجيل ولادة", autoReply: false },
  {
    id: "civil-marriage",
    group: "consular",
    en: "Marriage or Divorce Registration",
    ar: "تسجيل زواج أو طلاق",
    autoReply: false,
  },
  {
    id: "civil-death",
    group: "consular",
    en: "Death Registration & Repatriation",
    ar: "تسجيل وفاة وإعادة الرفات",
    autoReply: false,
  },
  { id: "legal-poa", group: "consular", en: "Power of Attorney", ar: "وكالة قانونية", autoReply: false },
  {
    id: "legal-attestation",
    group: "consular",
    en: "Document Attestation & Legalization",
    ar: "تصديق وتوثيق المستندات",
    autoReply: false,
  },

  { id: "general-inquiry", group: "other", en: "General Inquiry", ar: "استفسار عام", autoReply: false },
  { id: "media-press", group: "other", en: "Media / Press", ar: "الإعلام والصحافة", autoReply: false },
  { id: "other", group: "other", en: "Other", ar: "أخرى", autoReply: false },
];

const CATEGORY_BY_ID = new Map(CONTACT_CATEGORIES.map((category) => [category.id, category]));

export function findContactCategory(id: string): ContactCategory | undefined {
  return CATEGORY_BY_ID.get(id);
}

export function getCategoryLabel(category: ContactCategory, locale: Locale): string {
  return locale === "ar" ? category.ar : category.en;
}

export function getGroupLabel(group: ContactCategoryGroup, locale: Locale): string {
  return locale === "ar" ? group.ar : group.en;
}

/**
 * Categories arranged into their groups, in declaration order, for rendering
 * grouped <optgroup> options.
 */
export function getGroupedContactCategories(): { group: ContactCategoryGroup; categories: ContactCategory[] }[] {
  return CONTACT_CATEGORY_GROUPS.map((group) => ({
    group,
    categories: CONTACT_CATEGORIES.filter((category) => category.group === group.id),
  })).filter((entry) => entry.categories.length > 0);
}
