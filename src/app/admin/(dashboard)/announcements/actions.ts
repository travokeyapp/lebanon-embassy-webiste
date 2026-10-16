"use server";

import { revalidateTag } from "next/cache";
import { logAudit } from "@/lib/audit";
import { authorizeArea } from "@/lib/auth/session";
import { ANNOUNCEMENTS_CACHE_TAG } from "@/lib/content/announcements-public";
import { announcementInputSchema } from "@/lib/content/announcements-schema";
import {
  deleteAnnouncement,
  insertAnnouncement,
  setAnnouncementActive,
  updateAnnouncement,
} from "@/lib/content/announcements-store";
import { collectFieldErrors, type FieldErrors } from "@/lib/news-schema";

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: FieldErrors };
export type ActionResult = { ok: true } | { ok: false; error: string };


export async function saveAnnouncementAction(id: string | null, rawInput: unknown): Promise<SaveResult> {
  const auth = await authorizeArea("announcements");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  const parsed = announcementInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: collectFieldErrors(parsed.error.issues) };
  }
  try {
    const record = id
      ? await updateAnnouncement(id, parsed.data, session.email)
      : await insertAnnouncement(parsed.data, session.email);
    if (!record) {
      return { ok: false, error: "This announcement no longer exists." };
    }
    revalidateTag(ANNOUNCEMENTS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: id ? "announcement.update" : "announcement.create",
      entity: "announcement",
      entityId: record.id,
      summary: record.text.en.slice(0, 80),
    });
    return { ok: true, id: record.id };
  } catch (error) {
    console.error("saveAnnouncementAction failed:", error);
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function setAnnouncementActiveAction(id: string, active: boolean): Promise<ActionResult> {
  const auth = await authorizeArea("announcements");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  try {
    const record = await setAnnouncementActive(id, active, session.email);
    if (!record) {
      return { ok: false, error: "This announcement no longer exists." };
    }
    revalidateTag(ANNOUNCEMENTS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: active ? "announcement.activate" : "announcement.deactivate",
      entity: "announcement",
      entityId: id,
      summary: record.text.en.slice(0, 80),
    });
    return { ok: true };
  } catch (error) {
    console.error("setAnnouncementActiveAction failed:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  const auth = await authorizeArea("announcements");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  try {
    const record = await deleteAnnouncement(id);
    if (!record) {
      return { ok: false, error: "This announcement no longer exists." };
    }
    revalidateTag(ANNOUNCEMENTS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: "announcement.delete",
      entity: "announcement",
      entityId: id,
      summary: record.text.en.slice(0, 80),
    });
    return { ok: true };
  } catch (error) {
    console.error("deleteAnnouncementAction failed:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
