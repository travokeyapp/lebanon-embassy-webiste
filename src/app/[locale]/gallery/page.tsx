import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

const collectionKeys = ["diplomatic", "national", "consular", "cultural"] as const;
type GalleryCollectionKey = (typeof collectionKeys)[number];

type GalleryItem = {
  id: string;
  collectionKey: GalleryCollectionKey;
  collection: string;
  date: string;
  title: string;
  caption: string;
  toneClass: "galleryToneRed" | "galleryToneGreen" | "galleryToneCharcoal" | "galleryToneSand";
};

type GalleryCopy = {
  title: string;
  lead: string;
  collections: string[];
  allCollections: string;
  noItems: string;
  mediaContactLabel: string;
  mediaContactLink: string;
  items: GalleryItem[];
};

const content: Record<"en" | "ar", GalleryCopy> = {
  en: {
    title: "Gallery",
    lead: "A visual archive of official engagements, community activities, and embassy programs.",
    collections: ["Diplomatic Meetings", "National Events", "Consular Outreach", "Cultural Programs"],
    allCollections: "All",
    noItems: "No items found for this collection.",
    mediaContactLabel: "For media requests, event photos, or press material:",
    mediaContactLink: "Contact the Embassy",
    items: [
      {
        id: "gallery-1",
        collectionKey: "diplomatic",
        collection: "Diplomatic Meetings",
        date: "January 2026",
        title: "Bilateral Consultation Session",
        caption: "Delegation-level discussion focused on regional cooperation and institutional coordination.",
        toneClass: "galleryToneRed",
      },
      {
        id: "gallery-2",
        collectionKey: "national",
        collection: "National Events",
        date: "December 2025",
        title: "Independence Day Reception",
        caption: "Formal reception hosted with diplomatic guests, officials, and Lebanese community members.",
        toneClass: "galleryToneGreen",
      },
      {
        id: "gallery-3",
        collectionKey: "consular",
        collection: "Consular Outreach",
        date: "November 2025",
        title: "Public Consular Briefing",
        caption: "Open briefing covering document requirements, submission flow, and service timelines.",
        toneClass: "galleryToneCharcoal",
      },
      {
        id: "gallery-4",
        collectionKey: "cultural",
        collection: "Cultural Programs",
        date: "October 2025",
        title: "Lebanon Cultural Showcase",
        caption: "Program featuring Lebanese heritage, language exchange, and student cultural participation.",
        toneClass: "galleryToneSand",
      },
      {
        id: "gallery-5",
        collectionKey: "diplomatic",
        collection: "Diplomatic Meetings",
        date: "September 2025",
        title: "Trade and Investment Roundtable",
        caption: "Dialogue with public and private stakeholders on commercial partnerships and market access.",
        toneClass: "galleryToneRed",
      },
      {
        id: "gallery-6",
        collectionKey: "consular",
        collection: "Consular Outreach",
        date: "August 2025",
        title: "Community Service Day",
        caption: "Focused consular support session for documentation queries and citizen assistance.",
        toneClass: "galleryToneGreen",
      },
    ],
  },
  ar: {
    title: "معرض الصور",
    lead: "أرشيف بصري للفعاليات الرسمية وأنشطة الجالية والبرامج التي تنظمها السفارة.",
    collections: ["اللقاءات الدبلوماسية", "الفعاليات الوطنية", "التواصل القنصلي", "البرامج الثقافية"],
    allCollections: "الكل",
    noItems: "لا توجد عناصر ضمن هذا التصنيف.",
    mediaContactLabel: "لطلبات الصور الإعلامية أو مواد التغطية الصحفية:",
    mediaContactLink: "تواصل مع السفارة",
    items: [
      {
        id: "gallery-1",
        collectionKey: "diplomatic",
        collection: "اللقاءات الدبلوماسية",
        date: "يناير 2026",
        title: "جلسة مشاورات ثنائية",
        caption: "مناقشات على مستوى الوفود ركزت على التعاون الإقليمي وآليات التنسيق المؤسسي.",
        toneClass: "galleryToneRed",
      },
      {
        id: "gallery-2",
        collectionKey: "national",
        collection: "الفعاليات الوطنية",
        date: "ديسمبر 2025",
        title: "حفل استقبال عيد الاستقلال",
        caption: "استقبال رسمي بحضور ضيوف دبلوماسيين ومسؤولين وأبناء الجالية اللبنانية.",
        toneClass: "galleryToneGreen",
      },
      {
        id: "gallery-3",
        collectionKey: "consular",
        collection: "التواصل القنصلي",
        date: "نوفمبر 2025",
        title: "إحاطة قنصلية عامة",
        caption: "جلسة مفتوحة حول متطلبات المعاملات وآلية التقديم وفترات الإنجاز.",
        toneClass: "galleryToneCharcoal",
      },
      {
        id: "gallery-4",
        collectionKey: "cultural",
        collection: "البرامج الثقافية",
        date: "أكتوبر 2025",
        title: "فعالية الثقافة اللبنانية",
        caption: "برنامج تضمن تعريفًا بالتراث اللبناني ومشاركة طلابية في أنشطة ثقافية.",
        toneClass: "galleryToneSand",
      },
      {
        id: "gallery-5",
        collectionKey: "diplomatic",
        collection: "اللقاءات الدبلوماسية",
        date: "سبتمبر 2025",
        title: "مائدة مستديرة للتجارة والاستثمار",
        caption: "حوار مع جهات رسمية وخاصة حول فرص الشراكات التجارية والوصول إلى الأسواق.",
        toneClass: "galleryToneRed",
      },
      {
        id: "gallery-6",
        collectionKey: "consular",
        collection: "التواصل القنصلي",
        date: "أغسطس 2025",
        title: "يوم خدمة الجالية",
        caption: "جلسة دعم قنصلي مخصصة للاستفسارات المتعلقة بالمعاملات وخدمات المواطنين.",
        toneClass: "galleryToneGreen",
      },
    ],
  },
};

type GallerySearchParams = {
  collection?: string | string[];
};

function parseCollectionFilter(value: string | string[] | undefined): GalleryCollectionKey | "all" {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return "all";
  }
  return collectionKeys.includes(raw as GalleryCollectionKey) ? (raw as GalleryCollectionKey) : "all";
}

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<GallerySearchParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];
  const query = (await searchParams) ?? {};

  const activeCollection = parseCollectionFilter(query.collection);
  const filters = [
    { key: "all" as const, label: t.allCollections },
    ...collectionKeys.map((key, index) => ({
      key,
      label: t.collections[index] ?? key,
    })),
  ];

  const filteredItems =
    activeCollection === "all" ? t.items : t.items.filter((item) => item.collectionKey === activeCollection);

  const filterHref = (key: GalleryCollectionKey | "all") =>
    key === "all" ? `/${locale}/gallery` : `/${locale}/gallery?collection=${key}`;

  return (
    <SiteShell locale={locale} activeNav="gallery">
      <section className="section container">
        <header className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </header>

        <div className="galleryCollections" aria-label="Gallery collections">
          {filters.map((filter) => (
            <Link
              key={filter.key}
              className={`galleryChip${activeCollection === filter.key ? " isActive" : ""}`}
              href={filterHref(filter.key)}
              aria-current={activeCollection === filter.key ? "true" : undefined}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        {filteredItems.length > 0 ? (
          <div className="galleryGrid">
            {filteredItems.map((item) => (
              <article className="galleryCard" key={item.id}>
                <div className={`galleryMedia ${item.toneClass}`}>
                  <span className="galleryMediaTag">{item.collection}</span>
                </div>

                <div className="galleryBody">
                  <p className="galleryDate">{item.date}</p>
                  <h3 className="galleryTitle">{item.title}</h3>
                  <p className="galleryCaption">{item.caption}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="galleryEmpty">{t.noItems}</p>
        )}

        <aside className="galleryNotice">
          <p>{t.mediaContactLabel}</p>
          <Link className="galleryNoticeLink" href={`/${locale}/contact`}>
            {t.mediaContactLink}
          </Link>
        </aside>
      </section>
    </SiteShell>
  );
}
