import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { GalleryInput, GalleryRecord } from "@/lib/content/gallery-schema";

export type GalleryDoc = GalleryInput & { order: number; createdAt: Date; updatedAt: Date; updatedBy: string };

const SORT = { order: 1, createdAt: -1 } as const;

export async function galleryCollection(): Promise<Collection<GalleryDoc>> {
  const db = await getDb();
  return db.collection<GalleryDoc>("gallery");
}

function toRecord(doc: WithId<GalleryDoc>): GalleryRecord {
  return {
    id: doc._id.toHexString(),
    image: doc.image ?? null,
    collection: doc.collection,
    date: doc.date ?? { en: "", ar: "" },
    title: doc.title,
    caption: doc.caption ?? { en: "", ar: "" },
    visible: doc.visible,
    order: doc.order ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    updatedBy: doc.updatedBy,
  };
}

export async function listGalleryItems(): Promise<GalleryRecord[]> {
  const collection = await galleryCollection();
  return (await collection.find({}).sort(SORT).toArray()).map(toRecord);
}

export async function listVisibleGalleryItems(): Promise<GalleryRecord[]> {
  const collection = await galleryCollection();
  return (await collection.find({ visible: true }).sort(SORT).toArray()).map(toRecord);
}

export async function countGalleryItems(): Promise<number> {
  const collection = await galleryCollection();
  return collection.countDocuments({});
}

export async function getGalleryItemById(id: string): Promise<GalleryRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await galleryCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toRecord(doc) : null;
}

export async function insertGalleryItem(input: GalleryInput, actor: string): Promise<GalleryRecord> {
  const collection = await galleryCollection();
  const now = new Date();
  // New photos go first.
  const first = await collection.find({}).sort({ order: 1 }).limit(1).toArray();
  const doc: GalleryDoc = { ...input, order: (first[0]?.order ?? 1) - 1, createdAt: now, updatedAt: now, updatedBy: actor };
  const result = await collection.insertOne(doc);
  return toRecord({ ...doc, _id: result.insertedId });
}

export async function updateGalleryItem(id: string, input: GalleryInput, actor: string): Promise<GalleryRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await galleryCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date(), updatedBy: actor } },
    { returnDocument: "after" },
  );
  return result ? toRecord(result) : null;
}

export async function setGalleryItemVisible(id: string, visible: boolean, actor: string): Promise<GalleryRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await galleryCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { visible, updatedAt: new Date(), updatedBy: actor } },
    { returnDocument: "after" },
  );
  return result ? toRecord(result) : null;
}

export async function moveGalleryItem(id: string, delta: -1 | 1): Promise<boolean> {
  const items = await listGalleryItems();
  const index = items.findIndex((item) => item.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= items.length) {
    return false;
  }
  const collection = await galleryCollection();
  await collection.bulkWrite(
    items.map((item, position) => ({
      updateOne: {
        filter: { _id: new ObjectId(item.id) },
        update: { $set: { order: position === index ? target : position === target ? index : position } },
      },
    })),
  );
  return true;
}

export async function deleteGalleryItem(id: string): Promise<GalleryRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await galleryCollection();
  const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });
  return result ? toRecord(result) : null;
}
