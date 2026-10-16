import type { Collection } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { PageContent, PageKey } from "@/lib/content/page-schema";

export type PageDoc = {
  key: PageKey;
  content: PageContent;
  updatedAt: Date;
  updatedBy: string;
};

export async function pagesCollection(): Promise<Collection<PageDoc>> {
  const db = await getDb();
  return db.collection<PageDoc>("pages");
}

export async function getStoredPage(key: PageKey): Promise<PageDoc | null> {
  const pages = await pagesCollection();
  return pages.findOne({ key });
}

export async function savePage(key: PageKey, content: PageContent, actor: string): Promise<void> {
  const pages = await pagesCollection();
  await pages.updateOne({ key }, { $set: { key, content, updatedAt: new Date(), updatedBy: actor } }, { upsert: true });
}
