"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { getVerifiedSession } from "@/lib/auth/session";
import { NEWS_CACHE_TAG } from "@/lib/news-public";
import {
  NEWS_STATUSES,
  collectFieldErrors,
  newsInputSchema,
  type FieldErrors,
  type NewsStatus,
} from "@/lib/news-schema";
import {
  SlugTakenError,
  deleteNews,
  insertNews,
  setNewsStatus,
  updateNews,
} from "@/lib/news-store";

export type SaveNewsResult =
  | { ok: true; id: string; status: NewsStatus }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export type ActionResult = { ok: true } | { ok: false; error: string };

const SESSION_EXPIRED = "Your session has expired. Please sign in again.";
const GENERIC_FAILURE = "Something went wrong. Please try again.";

export async function saveNewsAction(id: string | null, rawInput: unknown): Promise<SaveNewsResult> {
  const session = await getVerifiedSession();
  if (!session) {
    return { ok: false, error: SESSION_EXPIRED };
  }

  const parsed = newsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  try {
    const record = id
      ? await updateNews(id, parsed.data, session.email)
      : await insertNews(parsed.data, session.email);
    if (!record) {
      return { ok: false, error: "This news item no longer exists." };
    }

    revalidateTag(NEWS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: id ? "news.update" : "news.create",
      entity: "news",
      entityId: record.id,
      summary: `${record.status}: ${record.slug}`,
    });

    return { ok: true, id: record.id, status: record.status };
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return {
        ok: false,
        error: "That slug is already used by another news item.",
        fieldErrors: { slug: "Already in use. Choose a different slug." },
      };
    }
    console.error("saveNewsAction failed:", error);
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function setNewsStatusAction(id: string, status: NewsStatus): Promise<ActionResult> {
  const session = await getVerifiedSession();
  if (!session) {
    return { ok: false, error: SESSION_EXPIRED };
  }
  if (!NEWS_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  try {
    const record = await setNewsStatus(id, status, session.email);
    if (!record) {
      return { ok: false, error: "This news item no longer exists." };
    }
    revalidateTag(NEWS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: status === "published" ? "news.publish" : "news.unpublish",
      entity: "news",
      entityId: record.id,
      summary: record.slug,
    });
    return { ok: true };
  } catch (error) {
    console.error("setNewsStatusAction failed:", error);
    return { ok: false, error: GENERIC_FAILURE };
  }
}

export async function deleteNewsAction(id: string): Promise<ActionResult> {
  const session = await getVerifiedSession();
  if (!session) {
    return { ok: false, error: SESSION_EXPIRED };
  }

  try {
    const record = await deleteNews(id);
    if (!record) {
      return { ok: false, error: "This news item no longer exists." };
    }
    revalidateTag(NEWS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: "news.delete",
      entity: "news",
      entityId: record.id,
      summary: `${record.slug} | ${record.title.en}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("deleteNewsAction failed:", error);
    return { ok: false, error: GENERIC_FAILURE };
  }
}

// Clears the cached news on the public site so it re-reads the database on
// the next visit. Useful after importing data outside the admin.
export async function refreshSiteCacheAction(): Promise<void> {
  const session = await getVerifiedSession();
  if (!session) {
    redirect("/admin/login");
  }
  revalidateTag(NEWS_CACHE_TAG);
  await logAudit({
    userId: session.id,
    userEmail: session.email,
    action: "news.cache-refresh",
    entity: "news",
  });
  redirect("/admin/news?refreshed=1");
}
