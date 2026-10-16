import { unstable_cache } from "next/cache";
import { announcementState, type AnnouncementRecord } from "@/lib/content/announcements-schema";
import { listActiveAnnouncements } from "@/lib/content/announcements-store";
import { todayIsoDate } from "@/lib/news-dates";

export const ANNOUNCEMENTS_CACHE_TAG = "announcements";

const cachedActive = unstable_cache(async () => listActiveAnnouncements(), ["active-announcements"], {
  tags: [ANNOUNCEMENTS_CACHE_TAG],
});

// Active notices whose date window includes today (embassy time). The date
// check happens per request so scheduled notices appear and expire on their
// own without anyone touching the admin.
export async function getLiveAnnouncements(): Promise<AnnouncementRecord[]> {
  try {
    const today = todayIsoDate();
    return (await cachedActive()).filter((item) => announcementState(item, today) === "live");
  } catch (error) {
    console.error("Loading announcements failed:", error);
    return [];
  }
}
