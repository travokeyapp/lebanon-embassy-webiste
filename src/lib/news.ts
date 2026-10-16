import type { Locale } from "@/lib/locale";
import { formatNewsDate } from "@/lib/news-dates";
import { getPublishedNewsCached } from "@/lib/news-public";
import type { NewsImage, NewsRecord } from "@/lib/news-store";

// Shape consumed by the public pages. News content itself is managed in the
// admin portal (/admin/news) and stored in MongoDB.
export type NewsItem = {
  slug: string;
  month: string;
  day: string;
  title: string;
  excerpt: string;
  image?: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  gallery?: {
    src: string;
    width: number;
    height: number;
    alt: string;
  }[];
  attachment?: {
    href: string;
    label: string;
  };
};

export const HOME_NEWS_PAGE_SIZE = 3;
export const NEWS_ARCHIVE_PAGE_SIZE = 6;

function pick(text: { en: string; ar: string }, locale: Locale): string {
  return text[locale] || text.en;
}

export function toNewsItem(record: NewsRecord, locale: Locale): NewsItem {
  const { day, month } = formatNewsDate(record.date, locale);
  const title = pick(record.title, locale);
  const localizeImage = (image: NewsImage) => ({
    src: image.src,
    width: image.width,
    height: image.height,
    alt: pick(image.alt, locale) || title,
  });

  return {
    slug: record.slug,
    month,
    day,
    title,
    excerpt: pick(record.excerpt, locale),
    image: record.image ? localizeImage(record.image) : undefined,
    gallery: record.gallery.length > 0 ? record.gallery.map(localizeImage) : undefined,
    attachment: record.attachment
      ? { href: record.attachment.href, label: pick(record.attachment.label, locale) }
      : undefined,
  };
}

export async function getNewsForLocale(locale: Locale): Promise<NewsItem[]> {
  let records: NewsRecord[];
  try {
    records = await getPublishedNewsCached();
  } catch (error) {
    // Keep the public site up if the database is unreachable; the failure is
    // not cached, so the next request tries again.
    console.error("Loading published news failed:", error);
    return [];
  }
  return records.map((record) => toNewsItem(record, locale));
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
