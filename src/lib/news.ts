import type { Locale } from "@/lib/locale";

export type NewsItem = {
  slug: string;
  month: string;
  day: string;
  title: string;
  excerpt: string;
};

type LocalizedNewsItem = {
  slug: string;
  day: string;
  month: Record<Locale, string>;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
};

// Single source for all news. Add/remove items here.
const newsCatalog: LocalizedNewsItem[] = [
  // {
  //   slug: "minister-commerce-meeting",
  //   day: "15",
  //   month: {
  //     en: "JAN",
  //     ar: "\u064a\u0646\u0627\u064a\u0631",
  //   },
  //   title: {
  //     en: "Ambassador Issa meets with Federal Minister of Commerce",
  //     ar: "\u0644\u0642\u0627\u0621 \u0627\u0644\u0633\u0641\u064a\u0631 \u0639\u064a\u0633\u0649 \u0645\u0639 \u0648\u0632\u064a\u0631 \u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0641\u064a\u062f\u0631\u0627\u0644\u064a",
  //   },
  //   excerpt: {
  //     en: "H.E. Mr. Abdulaziz Issa discussed bilateral trade priorities and practical steps to improve private-sector cooperation between Lebanon and Pakistan.",
  //     ar: "\u0628\u062d\u062b \u0633\u0639\u0627\u062f\u0629 \u0627\u0644\u0633\u0641\u064a\u0631 \u0639\u0628\u062f\u0627\u0644\u0639\u0632\u064a\u0632 \u0639\u064a\u0633\u0649 \u0623\u0648\u0644\u0648\u064a\u0627\u062a \u0627\u0644\u062a\u0639\u0627\u0648\u0646 \u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0648\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0629 \u0644\u062a\u0639\u0632\u064a\u0632 \u0627\u0644\u0634\u0631\u0627\u0643\u0627\u062a \u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f\u064a\u0629 \u0628\u064a\u0646 \u0644\u0628\u0646\u0627\u0646 \u0648\u0628\u0627\u0643\u0633\u062a\u0627\u0646.",
  //   },
  // },
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