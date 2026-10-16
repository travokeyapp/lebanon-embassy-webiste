import { unstable_cache } from "next/cache";
import { listPublishedNews } from "@/lib/news-store";

// Published news is cached across requests and purged with
// revalidateTag(NEWS_CACHE_TAG) whenever an editor saves, publishes or deletes.
export const NEWS_CACHE_TAG = "news";

export const getPublishedNewsCached = unstable_cache(async () => listPublishedNews(), ["published-news"], {
  tags: [NEWS_CACHE_TAG],
});
