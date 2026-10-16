import type { Locale } from "@/lib/locale";
import { toNewsItem, type NewsItem } from "@/lib/news-item";
import { getPublishedNewsCached } from "@/lib/news-public";
import type { NewsRecord } from "@/lib/news-store";

// News content is managed in the admin portal (/admin/news) and stored in
// MongoDB. This module is the server-side entry point for the public pages.

export type { NewsItem } from "@/lib/news-item";
export { toNewsItem } from "@/lib/news-item";

export const HOME_NEWS_PAGE_SIZE = 3;
export const NEWS_ARCHIVE_PAGE_SIZE = 6;

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
