"use server";

import { revalidateTag } from "next/cache";
import { logAudit } from "@/lib/audit";
import { authorizeArea } from "@/lib/auth/session";
import { DOCUMENTS_CACHE_TAG } from "@/lib/content/documents-public";
import { documentInputSchema } from "@/lib/content/documents-schema";
import { deleteDocument, insertDocument, moveDocument, setDocumentVisible, updateDocument } from "@/lib/content/documents-store";
import { collectFieldErrors, type FieldErrors } from "@/lib/news-schema";

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: FieldErrors };
export type ActionResult = { ok: true } | { ok: false; error: string };

const GENERIC = "Something went wrong. Please try again.";

export async function saveDocumentAction(id: string | null, rawInput: unknown): Promise<SaveResult> {
  const auth = await authorizeArea("documents");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  const parsed = documentInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: collectFieldErrors(parsed.error.issues) };
  }
  try {
    const record = id ? await updateDocument(id, parsed.data, session.email) : await insertDocument(parsed.data, session.email);
    if (!record) {
      return { ok: false, error: "This document no longer exists." };
    }
    revalidateTag(DOCUMENTS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: id ? "document.update" : "document.create",
      entity: "document",
      entityId: record.id,
      summary: record.title.en,
    });
    return { ok: true, id: record.id };
  } catch (error) {
    console.error("saveDocumentAction failed:", error);
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function setDocumentVisibleAction(id: string, visible: boolean): Promise<ActionResult> {
  const auth = await authorizeArea("documents");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  try {
    const record = await setDocumentVisible(id, visible, session.email);
    if (!record) {
      return { ok: false, error: "This document no longer exists." };
    }
    revalidateTag(DOCUMENTS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: visible ? "document.show" : "document.hide",
      entity: "document",
      entityId: id,
      summary: record.title.en,
    });
    return { ok: true };
  } catch (error) {
    console.error("setDocumentVisibleAction failed:", error);
    return { ok: false, error: GENERIC };
  }
}

export async function moveDocumentAction(id: string, delta: -1 | 1): Promise<ActionResult> {
  const auth = await authorizeArea("documents");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
    try {
    await moveDocument(id, delta);
    revalidateTag(DOCUMENTS_CACHE_TAG);
    return { ok: true };
  } catch (error) {
    console.error("moveDocumentAction failed:", error);
    return { ok: false, error: GENERIC };
  }
}

export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  const auth = await authorizeArea("documents");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const session = auth.session;
  try {
    const record = await deleteDocument(id);
    if (!record) {
      return { ok: false, error: "This document no longer exists." };
    }
    revalidateTag(DOCUMENTS_CACHE_TAG);
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: "document.delete",
      entity: "document",
      entityId: id,
      summary: record.title.en,
    });
    return { ok: true };
  } catch (error) {
    console.error("deleteDocumentAction failed:", error);
    return { ok: false, error: GENERIC };
  }
}
