import type { Locale } from "@/lib/locale";
import { formatNewsDate } from "@/lib/news-dates";
import type { LocalizedText, NewsAttachment, NewsImage } from "@/lib/news-store";

// Pure mapping from stored (bilingual) news content to what one locale of the
// site renders. Safe to use in client components (no server imports).

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

export type NewsContent = {
  slug: string;
  date: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  image: NewsImage | null;
  gallery: NewsImage[];
  attachment: NewsAttachment | null;
};

function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en;
}

export function toNewsItem(content: NewsContent, locale: Locale): NewsItem {
  const { day, month } = formatNewsDate(content.date, locale);
  const title = pick(content.title, locale);
  const localizeImage = (image: NewsImage) => ({
    src: image.src,
    width: image.width,
    height: image.height,
    alt: pick(image.alt, locale) || title,
  });

  return {
    slug: content.slug,
    month,
    day,
    title,
    excerpt: pick(content.excerpt, locale),
    image: content.image ? localizeImage(content.image) : undefined,
    gallery: content.gallery.length > 0 ? content.gallery.map(localizeImage) : undefined,
    attachment: content.attachment
      ? { href: content.attachment.href, label: pick(content.attachment.label, locale) }
      : undefined,
  };
}
