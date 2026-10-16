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
  "media.upload": "Uploaded a file",
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
