import { unstable_cache } from "next/cache";
import type { GalleryRecord } from "@/lib/content/gallery-schema";
import { listVisibleGalleryItems } from "@/lib/content/gallery-store";

export const GALLERY_CACHE_TAG = "gallery";

const placeholder = (
  id: string,
  collection: GalleryRecord["collection"],
  toneClass: GalleryRecord["toneClass"],
  date: { en: string; ar: string },
  title: { en: string; ar: string },
  caption: { en: string; ar: string },
): GalleryRecord => ({
  id,
  image: null,
  collection,
  date,
  title,
  caption,
  visible: true,
  order: 0,
  toneClass,
  createdAt: "",
  updatedAt: "",
  updatedBy: "",
});

// The illustrative cards the site shipped with, shown until real photos are added.
export const GALLERY_DEFAULTS: GalleryRecord[] = [
  placeholder("gallery-1", "diplomatic", "galleryToneRed", { en: "January 2026", ar: "يناير 2026" }, { en: "Bilateral Consultation Session", ar: "جلسة مشاورات ثنائية" }, { en: "Delegation-level discussion focused on regional cooperation and institutional coordination.", ar: "مناقشات على مستوى الوفود ركزت على التعاون الإقليمي وآليات التنسيق المؤسسي." }),
  placeholder("gallery-2", "national", "galleryToneGreen", { en: "December 2025", ar: "ديسمبر 2025" }, { en: "Independence Day Reception", ar: "حفل استقبال عيد الاستقلال" }, { en: "Formal reception hosted with diplomatic guests, officials, and Lebanese community members.", ar: "استقبال رسمي بحضور ضيوف دبلوماسيين ومسؤولين وأبناء الجالية اللبنانية." }),
  placeholder("gallery-3", "consular", "galleryToneCharcoal", { en: "November 2025", ar: "نوفمبر 2025" }, { en: "Public Consular Briefing", ar: "إحاطة قنصلية عامة" }, { en: "Open briefing covering document requirements, submission flow, and service timelines.", ar: "جلسة مفتوحة حول متطلبات المعاملات وآلية التقديم وفترات الإنجاز." }),
  placeholder("gallery-4", "cultural", "galleryToneSand", { en: "October 2025", ar: "أكتوبر 2025" }, { en: "Lebanon Cultural Showcase", ar: "فعالية الثقافة اللبنانية" }, { en: "Program featuring Lebanese heritage, language exchange, and student cultural participation.", ar: "برنامج تضمن تعريفًا بالتراث اللبناني ومشاركة طلابية في أنشطة ثقافية." }),
  placeholder("gallery-5", "diplomatic", "galleryToneRed", { en: "September 2025", ar: "سبتمبر 2025" }, { en: "Trade and Investment Roundtable", ar: "مائدة مستديرة للتجارة والاستثمار" }, { en: "Dialogue with public and private stakeholders on commercial partnerships and market access.", ar: "حوار مع جهات رسمية وخاصة حول فرص الشراكات التجارية والوصول إلى الأسواق." }),
  placeholder("gallery-6", "consular", "galleryToneGreen", { en: "August 2025", ar: "أغسطس 2025" }, { en: "Community Service Day", ar: "يوم خدمة الجالية" }, { en: "Focused consular support session for documentation queries and citizen assistance.", ar: "جلسة دعم قنصلي مخصصة للاستفسارات المتعلقة بالمعاملات وخدمات المواطنين." }),
];

const cachedVisible = unstable_cache(async () => listVisibleGalleryItems(), ["visible-gallery"], { tags: [GALLERY_CACHE_TAG] });

export async function getPublicGalleryItems(): Promise<GalleryRecord[]> {
  try {
    const items = await cachedVisible();
    return items.length > 0 ? items : GALLERY_DEFAULTS;
  } catch (error) {
    console.error("Loading gallery failed:", error);
    return GALLERY_DEFAULTS;
  }
}
