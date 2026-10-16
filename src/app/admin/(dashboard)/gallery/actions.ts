"use server";

import { revalidateTag } from "next/cache";
import { logAudit } from "@/lib/audit";
import { authorizeArea } from "@/lib/auth/session";
import { GALLERY_CACHE_TAG } from "@/lib/content/gallery-public";
import { galleryInputSchema } from "@/lib/content/gallery-schema";
import { deleteGalleryItem, insertGalleryItem, moveGalleryItem, setGalleryItemVisible, updateGalleryItem } from "@/lib/content/gallery-store";
import { collectFieldErrors, type FieldErrors } from "@/lib/news-schema";

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: FieldErrors };
export type ActionResult = { ok: true } | { ok: false; error: string };

const GENERIC = "Something went wrong. Please try again.";

export async function saveGalleryItemAction(id: string | null, rawInput: unknown): Promise<SaveResult> {
  const auth = await authorizeArea("gallery");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  const parsed = galleryInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: collectFieldErrors(parsed.error.issues) };
  }
  try {
    const record = id ? await updateGalleryItem(id, parsed.data, session.email) : await insertGalleryItem(parsed.data, session.email);
    if (!record) {
      return { ok: false, error: "This photo no longer exists." };
    }
    revalidateTag(GALLERY_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: id ? "gallery.update" : "gallery.create",
      entity: "gallery",
      entityId: record.id,
      summary: record.title.en,
    });
    return { ok: true, id: record.id };
  } catch (error) {
    console.error("saveGalleryItemAction failed:", error);
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function setGalleryItemVisibleAction(id: string, visible: boolean): Promise<ActionResult> {
  const auth = await authorizeArea("gallery");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  try {
    const record = await setGalleryItemVisible(id, visible, session.email);
    if (!record) {
      return { ok: false, error: "This photo no longer exists." };
    }
    revalidateTag(GALLERY_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: visible ? "gallery.show" : "gallery.hide",
      entity: "gallery",
      entityId: id,
      summary: record.title.en,
    });
    return { ok: true };
  } catch (error) {
    console.error("setGalleryItemVisibleAction failed:", error);
    return { ok: false, error: GENERIC };
  }
}

export async function moveGalleryItemAction(id: string, delta: -1 | 1): Promise<ActionResult> {
  const auth = await authorizeArea("gallery");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
    try {
    await moveGalleryItem(id, delta);
    revalidateTag(GALLERY_CACHE_TAG);
    return { ok: true };
  } catch (error) {
    console.error("moveGalleryItemAction failed:", error);
    return { ok: false, error: GENERIC };
  }
}

export async function deleteGalleryItemAction(id: string): Promise<ActionResult> {
  const auth = await authorizeArea("gallery");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  try {
    const record = await deleteGalleryItem(id);
    if (!record) {
      return { ok: false, error: "This photo no longer exists." };
    }
    revalidateTag(GALLERY_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: "gallery.delete",
      entity: "gallery",
      entityId: id,
      summary: record.title.en,
    });
    return { ok: true };
  } catch (error) {
    console.error("deleteGalleryItemAction failed:", error);
    return { ok: false, error: GENERIC };
  }
}
