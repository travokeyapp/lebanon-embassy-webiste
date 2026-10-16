import { unstable_cache } from "next/cache";
import type { HeroContent } from "@/lib/content/hero-schema";
import { getStoredHero } from "@/lib/content/hero-store";
import heroDefaults from "@/lib/content/defaults/hero.json";

export const HERO_CACHE_TAG = "hero";
export const HERO_DEFAULTS = heroDefaults as HeroContent;

const cachedHero = unstable_cache(
  async () => {
    const doc = await getStoredHero();
    return doc ? doc.content : null;
  },
  ["hero-content"],
  { tags: [HERO_CACHE_TAG] },
);

export async function getHeroContent(): Promise<HeroContent> {
  try {
    return (await cachedHero()) ?? HERO_DEFAULTS;
  } catch (error) {
    console.error("Loading hero content failed:", error);
    return HERO_DEFAULTS;
  }
}
