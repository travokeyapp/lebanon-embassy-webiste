import { unstable_cache } from "next/cache";
import { mergePageContent, type PageContent, type PageKey } from "@/lib/content/page-schema";
import { getStoredPage } from "@/lib/content/pages-store";
import aboutDefaults from "@/lib/content/defaults/about.json";
import ambassadorDefaults from "@/lib/content/defaults/ambassador.json";
import consularDefaults from "@/lib/content/defaults/consular.json";
import relationsDefaults from "@/lib/content/defaults/relations.json";
import servicesDefaults from "@/lib/content/defaults/services.json";
import settingsDefaults from "@/lib/content/defaults/settings.json";
import visasDefaults from "@/lib/content/defaults/visas.json";

// The content the site shipped with. Used until a page is saved in the admin,
// to fill in anything a saved page does not have, and when the database is
// unreachable.
export const PAGE_DEFAULTS: Record<PageKey, PageContent> = {
  about: aboutDefaults as PageContent,
  ambassador: ambassadorDefaults as PageContent,
  consular: consularDefaults as PageContent,
  relations: relationsDefaults as PageContent,
  services: servicesDefaults as PageContent,
  settings: settingsDefaults as PageContent,
  visas: visasDefaults as PageContent,
};

export function pageCacheTag(key: PageKey): string {
  return `page:${key}`;
}

const readers = new Map<PageKey, () => Promise<PageContent | null>>();

function cachedReader(key: PageKey): () => Promise<PageContent | null> {
  let reader = readers.get(key);
  if (!reader) {
    reader = unstable_cache(
      async () => {
        const doc = await getStoredPage(key);
        return doc ? doc.content : null;
      },
      [`page-content-${key}`],
      { tags: [pageCacheTag(key)] },
    );
    readers.set(key, reader);
  }
  return reader;
}

export async function getPageContent(key: PageKey): Promise<PageContent> {
  const defaults = PAGE_DEFAULTS[key];
  try {
    const stored = await cachedReader(key)();
    return mergePageContent(defaults, stored);
  } catch (error) {
    console.error(`Loading page content "${key}" failed:`, error);
    return defaults;
  }
}
