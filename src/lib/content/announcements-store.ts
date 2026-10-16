import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { AnnouncementInput, AnnouncementRecord } from "@/lib/content/announcements-schema";

export type AnnouncementDoc = Omit<AnnouncementRecord, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

const SORT = { order: 1, createdAt: -1 } as const;

export async function announcementsCollection(): Promise<Collection<AnnouncementDoc>> {
  const db = await getDb();
  return db.collection<AnnouncementDoc>("announcements");
}

function toRecord(doc: WithId<AnnouncementDoc>): AnnouncementRecord {
  return {
    id: doc._id.toHexString(),
    text: doc.text,
    tone: doc.tone,
    linkHref: doc.linkHref ?? null,
    linkLabel: doc.linkLabel ?? { en: "", ar: "" },
    startsAt: doc.startsAt ?? null,
    endsAt: doc.endsAt ?? null,
    active: doc.active,
    order: doc.order ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    updatedBy: doc.updatedBy,
  };
}

export async function listAnnouncements(): Promise<AnnouncementRecord[]> {
  const collection = await announcementsCollection();
  const docs = await collection.find({}).sort(SORT).toArray();
  return docs.map(toRecord);
}

export async function listActiveAnnouncements(): Promise<AnnouncementRecord[]> {
  const collection = await announcementsCollection();
  const docs = await collection.find({ active: true }).sort(SORT).toArray();
  return docs.map(toRecord);
}

export async function getAnnouncementById(id: string): Promise<AnnouncementRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await announcementsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toRecord(doc) : null;
}

export async function insertAnnouncement(input: AnnouncementInput, actor: string): Promise<AnnouncementRecord> {
  const collection = await announcementsCollection();
  const now = new Date();
  const last = await collection.find({}).sort({ order: -1 }).limit(1).toArray();
  const doc: AnnouncementDoc = {
    ...input,
    order: (last[0]?.order ?? 0) + 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor,
  };
  const result = await collection.insertOne(doc);
  return toRecord({ ...doc, _id: result.insertedId });
}

export async function updateAnnouncement(id: string, input: AnnouncementInput, actor: string): Promise<AnnouncementRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await announcementsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date(), updatedBy: actor } },
    { returnDocument: "after" },
  );
  return result ? toRecord(result) : null;
}

export async function setAnnouncementActive(id: string, active: boolean, actor: string): Promise<AnnouncementRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await announcementsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { active, updatedAt: new Date(), updatedBy: actor } },
    { returnDocument: "after" },
  );
  return result ? toRecord(result) : null;
}

export async function deleteAnnouncement(id: string): Promise<AnnouncementRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await announcementsCollection();
  const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });
  return result ? toRecord(result) : null;
}
