import type { Locale } from "@/lib/locale";

export type NewsItem = {
  slug: string;
  month: string;
  day: string;
  title: string;
  excerpt: string;
  attachment?: {
    href: string;
    label: string;
  };
};

type LocalizedNewsItem = {
  slug: string;
  day: string;
  month: Record<Locale, string>;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  attachment?: {
    href: string;
    label: Record<Locale, string>;
  };
};

// Single source for all news. Add/remove items here.
const newsCatalog: LocalizedNewsItem[] = [
  {
    slug: "lt2462-hr-lebanon-2026-event-brochure",
    day: "21",
    month: {
      en: "APR",
      ar: "\u0623\u0628\u0631\u064a\u0644",
    },
    title: {
      en: "HORECA Lebanon 2026: 21-24 April 2026 at Seaside Arena",
      ar: "HORECA \u0644\u0628\u0646\u0627\u0646 2026: \u0645\u0646 21 \u0625\u0644\u0649 24 \u0623\u0628\u0631\u064a\u0644 2026 \u0641\u064a Seaside Arena",
    },
    excerpt: {
      en: "The annual business meeting place for the hospitality and foodservice industries. Event timings are 3-9 PM. Download the official brochure for full details.",
      ar: "\u0627\u0644\u0645\u0644\u062a\u0642\u0649 \u0627\u0644\u0633\u0646\u0648\u064a \u0644\u0642\u0637\u0627\u0639\u064a \u0627\u0644\u0636\u064a\u0627\u0641\u0629 \u0648\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0637\u0639\u0627\u0645. \u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0629 \u0645\u0646 3 \u0625\u0644\u0649 9 \u0645\u0633\u0627\u0621\u064b. \u064a\u0631\u062c\u0649 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0643\u062a\u064a\u0628 \u0627\u0644\u0631\u0633\u0645\u064a \u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644.",
    },
    attachment: {
      href: "/documents/lt2462-hr-lebanon-2026-brochure.pdf",
      label: {
        en: "Download Event Brochure (PDF)",
        ar: "\u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0643\u062a\u064a\u0628 (PDF)",
      },
    },
  },
];

export const HOME_NEWS_PAGE_SIZE = 3;
export const NEWS_ARCHIVE_PAGE_SIZE = 6;

export function getNewsForLocale(locale: Locale): NewsItem[] {
  return newsCatalog.map((item) => ({
    slug: item.slug,
    month: item.month[locale],
    day: item.day,
    title: item.title[locale],
    excerpt: item.excerpt[locale],
    attachment: item.attachment
      ? {
          href: item.attachment.href,
          label: item.attachment.label[locale],
        }
      : undefined,
  }));
}

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function findPageBySlug(items: NewsItem[], slug: string, pageSize: number): number | null {
  const index = items.findIndex((item) => item.slug === slug);
  if (index < 0) {
    return null;
  }
  return Math.floor(index / pageSize) + 1;
}
