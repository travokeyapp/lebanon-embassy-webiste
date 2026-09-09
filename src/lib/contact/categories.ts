import type { Locale } from "@/lib/locale";

export type ContactCategoryGroupId = "visa" | "consular" | "other";

export type ContactCategory = {
  id: string;
  group: ContactCategoryGroupId;
  en: string;
  ar: string;
  /**
   * When true, the submission is answered solely by the automated reply sent to
   * the submitter, and NO notification is forwarded to the embassy inbox.
   * When false, the embassy is notified and the submitter receives nothing.
   * Exactly one email is sent either way.
   */
  autoReplyOnly: boolean;
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
  { id: "visa-tourist", group: "visa", en: "Tourist Visa", ar: "تأشيرة سياحية", autoReplyOnly: true },
  { id: "visa-business", group: "visa", en: "Business Visa", ar: "تأشيرة أعمال", autoReplyOnly: true },
  { id: "visa-family", group: "visa", en: "Family Visit Visa", ar: "زيارة عائلية", autoReplyOnly: true },
  { id: "visa-medical", group: "visa", en: "Medical Treatment Visa", ar: "زيارة للعلاج الطبي", autoReplyOnly: true },
  { id: "visa-training", group: "visa", en: "Training Course Visa", ar: "زيارة لحضور دورة تدريبية", autoReplyOnly: true },
  { id: "visa-transit", group: "visa", en: "Transit Visa", ar: "تأشيرة عبور", autoReplyOnly: true },
  { id: "visa-study", group: "visa", en: "Study Visa", ar: "زيارة للدراسة", autoReplyOnly: true },
  { id: "visa-general", group: "visa", en: "General Visa Inquiry", ar: "استفسار عام حول التأشيرات", autoReplyOnly: true },

  { id: "passport-renewal", group: "consular", en: "Passport Renewal", ar: "تجديد جواز السفر", autoReplyOnly: false },
  {
    id: "passport-travel-document",
    group: "consular",
    en: "Emergency Travel Document (Laissez-Passer)",
    ar: "وثيقة سفر طارئة (جواز مرور)",
    autoReplyOnly: false,
  },
  { id: "passport-lost", group: "consular", en: "Lost or Stolen Passport", ar: "جواز سفر مفقود أو مسروق", autoReplyOnly: false },
  { id: "civil-birth", group: "consular", en: "Birth Registration", ar: "تسجيل ولادة", autoReplyOnly: false },
  {
    id: "civil-marriage",
    group: "consular",
    en: "Marriage or Divorce Registration",
    ar: "تسجيل زواج أو طلاق",
    autoReplyOnly: false,
  },
  {
    id: "civil-death",
    group: "consular",
    en: "Death Registration & Repatriation",
    ar: "تسجيل وفاة وإعادة الرفات",
    autoReplyOnly: false,
  },
  { id: "legal-poa", group: "consular", en: "Power of Attorney", ar: "وكالة قانونية", autoReplyOnly: false },
  {
    id: "legal-attestation",
    group: "consular",
    en: "Document Attestation & Legalization",
    ar: "تصديق وتوثيق المستندات",
    autoReplyOnly: false,
  },

  { id: "general-inquiry", group: "other", en: "General Inquiry", ar: "استفسار عام", autoReplyOnly: false },
  { id: "media-press", group: "other", en: "Media / Press", ar: "الإعلام والصحافة", autoReplyOnly: false },
  { id: "other", group: "other", en: "Other", ar: "أخرى", autoReplyOnly: false },
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
