"use server";

import { revalidateTag } from "next/cache";
import { logAudit } from "@/lib/audit";
import { areaForPageKey } from "@/lib/auth/permissions";
import { authorizeArea } from "@/lib/auth/session";
import { PAGE_DEFS, buildPageSchema, isPageKey, type PageContent } from "@/lib/content/page-schema";
import { pageCacheTag } from "@/lib/content/pages-public";
import { savePage } from "@/lib/content/pages-store";
import { collectFieldErrors, type FieldErrors } from "@/lib/news-schema";

export type SavePageResult = { ok: true } | { ok: false; error: string; fieldErrors?: FieldErrors };

export async function savePageContentAction(key: string, rawInput: unknown): Promise<SavePageResult> {
  if (!isPageKey(key)) {
    return { ok: false, error: "Unknown page." };
  }
  const auth = await authorizeArea(areaForPageKey(key));
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;

  const parsed = buildPageSchema(PAGE_DEFS[key]).safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  try {
    await savePage(key, parsed.data as PageContent, session.email);
    revalidateTag(pageCacheTag(key));
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: "page.update",
      entity: "page",
      entityId: key,
      summary: PAGE_DEFS[key].label,
    });
    return { ok: true };
  } catch (error) {
    console.error("savePageContentAction failed:", error);
    return { ok: false, error: "Could not save. Please try again." };
  }
}
