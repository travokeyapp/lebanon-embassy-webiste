"use server";

import { revalidateTag } from "next/cache";
import { logAudit } from "@/lib/audit";
import { authorizeArea } from "@/lib/auth/session";
import { HERO_CACHE_TAG } from "@/lib/content/hero-public";
import { heroContentSchema } from "@/lib/content/hero-schema";
import { saveHero } from "@/lib/content/hero-store";
import { collectFieldErrors, type FieldErrors } from "@/lib/news-schema";

export type SaveHeroResult = { ok: true } | { ok: false; error: string; fieldErrors?: FieldErrors };

export async function saveHeroAction(rawInput: unknown): Promise<SaveHeroResult> {
  const auth = await authorizeArea("banners");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  const parsed = heroContentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: collectFieldErrors(parsed.error.issues) };
  }
  try {
    await saveHero(parsed.data, session.email);
    revalidateTag(HERO_CACHE_TAG);
    await logAudit({ userId: session.id, userEmail: session.email, action: "hero.update", entity: "hero" });
    return { ok: true };
  } catch (error) {
    console.error("saveHeroAction failed:", error);
    return { ok: false, error: "Could not save. Please try again." };
  }
}
