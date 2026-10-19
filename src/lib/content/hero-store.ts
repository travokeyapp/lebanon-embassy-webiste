import type { Collection } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { HeroContent } from "@/lib/content/hero-schema";

// Single-document settings live in the "siteBlocks" collection, keyed by name.
export type SiteBlockDoc<T> = { key: string; content: T; updatedAt: Date; updatedBy: string };

const HERO_KEY = "hero";

async function blocks<T>(): Promise<Collection<SiteBlockDoc<T>>> {
  const db = await getDb();
  return db.collection<SiteBlockDoc<T>>("siteBlocks");
}

export async function getStoredHero(): Promise<SiteBlockDoc<HeroContent> | null> {
  const collection = await blocks<HeroContent>();
  return collection.findOne({ key: HERO_KEY });
}

export async function saveHero(content: HeroContent, actor: string): Promise<void> {
  const collection = await blocks<HeroContent>();
  await collection.updateOne(
    { key: HERO_KEY },
    { $set: { key: HERO_KEY, content, updatedAt: new Date(), updatedBy: actor } },
    { upsert: true },
  );
}
