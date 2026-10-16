import type { ObjectId, WithId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

export type AuditEntry = {
  _id?: ObjectId;
  at: Date;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  summary?: string;
};

export type AuditRecord = {
  id: string;
  at: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  summary: string | null;
};

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "auth.password-change": "Changed password",
  "news.create": "Created news item",
  "news.update": "Updated news item",
  "news.publish": "Published news item",
  "news.unpublish": "Unpublished news item",
  "news.delete": "Deleted news item",
  "news.cache-refresh": "Refreshed the website cache",
  "page.update": "Updated a page",
  "announcement.create": "Created an announcement",
  "announcement.update": "Updated an announcement",
  "announcement.activate": "Switched an announcement on",
  "announcement.deactivate": "Switched an announcement off",
  "announcement.delete": "Deleted an announcement",
  "hero.update": "Updated the home banners",
  "document.create": "Added a document",
  "document.update": "Updated a document",
  "document.show": "Made a document visible",
  "document.hide": "Hid a document",
  "document.delete": "Deleted a document",
  "gallery.create": "Added a gallery photo",
  "gallery.update": "Updated a gallery photo",
  "gallery.show": "Made a gallery photo visible",
  "gallery.hide": "Hid a gallery photo",
  "gallery.delete": "Removed a gallery photo",
  "media.upload": "Uploaded a file",
  "user.create": "Created a staff account",
  "user.password-reset": "Reset a staff password",
  "user.activate": "Reactivated a staff account",
  "user.deactivate": "Deactivated a staff account",
  "user.role-change": "Changed a staff role",
};

export function describeAuditAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

// Best-effort: a failed audit write must never break the action it describes.
export async function logAudit(entry: Omit<AuditEntry, "at" | "_id">): Promise<void> {
  try {
    const db = await getDb();
    await db.collection<AuditEntry>("auditLog").insertOne({ ...entry, at: new Date() });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

export async function listAuditEntries(limit = 50): Promise<AuditRecord[]> {
  const db = await getDb();
  const docs = await db.collection<AuditEntry>("auditLog").find({}).sort({ at: -1 }).limit(limit).toArray();
  return docs.map((doc: WithId<AuditEntry>) => ({
    id: doc._id.toHexString(),
    at: doc.at.toISOString(),
    userEmail: doc.userEmail,
    action: doc.action,
    entity: doc.entity,
    entityId: doc.entityId ?? null,
    summary: doc.summary ?? null,
  }));
}
