import type { ObjectId } from "mongodb";
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

// Best-effort: a failed audit write must never break the action it describes.
export async function logAudit(entry: Omit<AuditEntry, "at" | "_id">): Promise<void> {
  try {
    const db = await getDb();
    await db.collection<AuditEntry>("auditLog").insertOne({ ...entry, at: new Date() });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}
