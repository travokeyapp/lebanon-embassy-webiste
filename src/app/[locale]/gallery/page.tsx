import Link from "next/link";
import HydrationSafeImage from "@/components/hydration-safe-image";
import SiteShell from "@/components/site-shell";
import { getPublicGalleryItems } from "@/lib/content/gallery-public";
import { GALLERY_COLLECTIONS, GALLERY_COLLECTION_LABELS, type GalleryCollection } from "@/lib/content/gallery-schema";
import { normalizeLocale } from "@/lib/locale";

const copy = {
  en: {
    title: "Gallery",
    lead: "A visual archive of official engagements, community activities, and embassy programs.",
    allCollections: "All",
    noItems: "No items found for this collection.",
    mediaContactLabel: "For media requests, event photos, or press material:",
    mediaContactLink: "Contact the Embassy",
  },
  ar: {
    title: "معرض الصور",
    lead: "أرشيف بصري للفعاليات الرسمية وأنشطة الجالية والبرامج التي تنظمها السفارة.",
    allCollections: "الكل",
    noItems: "لا توجد عناصر ضمن هذا التصنيف.",
    mediaContactLabel: "لطلبات الصور الإعلامية أو مواد التغطية الصحفية:",
    mediaContactLink: "تواصل مع السفارة",
  },
};

type GallerySearchParams = {
  collection?: string | string[];
};

function parseCollectionFilter(value: string | string[] | undefined): GalleryCollection | "all" {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return "all";
  }
  return (GALLERY_COLLECTIONS as readonly string[]).includes(raw) ? (raw as GalleryCollection) : "all";
}

function pick(text: { en: string; ar: string }, locale: "en" | "ar"): string {
  return text[locale] || text.en;
}

// Photos are managed in the admin under Gallery.
export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<GallerySearchParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = copy[locale];
  const query = (await searchParams) ?? {};
  const items = await getPublicGalleryItems();

  const activeCollection = parseCollectionFilter(query.collection);
  const filters = [
    { key: "all" as const, label: t.allCollections },
    ...GALLERY_COLLECTIONS.map((key) => ({ key, label: GALLERY_COLLECTION_LABELS[key][locale] })),
  ];

  const filteredItems = activeCollection === "all" ? items : items.filter((item) => item.collection === activeCollection);

  const filterHref = (key: GalleryCollection | "all") =>
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
            {filteredItems.map((item) => {
              const collectionLabel = GALLERY_COLLECTION_LABELS[item.collection][locale];
              return (
                <article className="galleryCard" key={item.id}>
                  <div className={`galleryMedia ${item.image ? "galleryMediaPhoto" : (item.toneClass ?? "galleryToneCharcoal")}`}>
                    {item.image ? (
                      <HydrationSafeImage
                        className="galleryImage"
                        src={item.image.src}
                        alt={pick(item.image.alt, locale) || pick(item.title, locale)}
                        width={item.image.width}
                        height={item.image.height}
                        sizes="(max-width: 720px) 92vw, 320px"
                      />
                    ) : null}
                    <span className="galleryMediaTag">{collectionLabel}</span>
                  </div>

                  <div className="galleryBody">
                    {pick(item.date, locale) ? <p className="galleryDate">{pick(item.date, locale)}</p> : null}
                    <h3 className="galleryTitle">{pick(item.title, locale)}</h3>
                    {pick(item.caption, locale) ? <p className="galleryCaption">{pick(item.caption, locale)}</p> : null}
                  </div>
                </article>
              );
            })}
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
