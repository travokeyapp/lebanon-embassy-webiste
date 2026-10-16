import type { AnnouncementRecord } from "@/lib/content/announcements-schema";
import type { Locale } from "@/lib/locale";

function pick(text: { en: string; ar: string }, locale: Locale): string {
  return text[locale] || text.en;
}

function localHref(locale: Locale, href: string): string {
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) {
    return href;
  }
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

// The notice strip under the site header. Managed in the admin under Announcements.
export default function AnnouncementBar({ items, locale }: { items: AnnouncementRecord[]; locale: Locale }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="siteNotices" role="region" aria-label={locale === "ar" ? "إعلانات" : "Announcements"}>
      <div className="container">
        {items.map((item) => (
          <div className={`siteNotice siteNotice-${item.tone}`} key={item.id}>
            <span className="siteNoticeText">{pick(item.text, locale)}</span>
            {item.linkHref ? (
              <a
                className="siteNoticeLink"
                href={localHref(locale, item.linkHref)}
                target={/^https?:\/\//i.test(item.linkHref) ? "_blank" : undefined}
                rel={/^https?:\/\//i.test(item.linkHref) ? "noreferrer" : undefined}
              >
                {pick(item.linkLabel, locale) || item.linkHref}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
