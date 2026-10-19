import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { DocumentInput, DocumentRecord } from "@/lib/content/documents-schema";

export type DocumentDoc = DocumentInput & { order: number; createdAt: Date; updatedAt: Date; updatedBy: string };

const SORT = { order: 1, createdAt: 1 } as const;

export async function documentsCollection(): Promise<Collection<DocumentDoc>> {
  const db = await getDb();
  return db.collection<DocumentDoc>("documents");
}

function toRecord(doc: WithId<DocumentDoc>): DocumentRecord {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    description: doc.description ?? { en: "", ar: "" },
    category: doc.category,
    href: doc.href,
    fileName: doc.fileName ?? "",
    contentType: doc.contentType ?? "",
    size: doc.size ?? 0,
    visible: doc.visible,
    order: doc.order ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    updatedBy: doc.updatedBy,
  };
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const collection = await documentsCollection();
  return (await collection.find({}).sort(SORT).toArray()).map(toRecord);
}

export async function listVisibleDocuments(): Promise<DocumentRecord[]> {
  const collection = await documentsCollection();
  return (await collection.find({ visible: true }).sort(SORT).toArray()).map(toRecord);
}

export async function countDocuments(): Promise<number> {
  const collection = await documentsCollection();
  return collection.countDocuments({});
}

export async function getDocumentById(id: string): Promise<DocumentRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await documentsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toRecord(doc) : null;
}

export async function insertDocument(input: DocumentInput, actor: string): Promise<DocumentRecord> {
  const collection = await documentsCollection();
  const now = new Date();
  const last = await collection.find({}).sort({ order: -1 }).limit(1).toArray();
  const doc: DocumentDoc = { ...input, order: (last[0]?.order ?? 0) + 1, createdAt: now, updatedAt: now, updatedBy: actor };
  const result = await collection.insertOne(doc);
  return toRecord({ ...doc, _id: result.insertedId });
}

export async function updateDocument(id: string, input: DocumentInput, actor: string): Promise<DocumentRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await documentsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date(), updatedBy: actor } },
    { returnDocument: "after" },
  );
  return result ? toRecord(result) : null;
}

export async function setDocumentVisible(id: string, visible: boolean, actor: string): Promise<DocumentRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await documentsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { visible, updatedAt: new Date(), updatedBy: actor } },
    { returnDocument: "after" },
  );
  return result ? toRecord(result) : null;
}

// Swaps the order with the neighbour above or below (within the whole list).
export async function moveDocument(id: string, delta: -1 | 1): Promise<boolean> {
  const docs = await listDocuments();
  const index = docs.findIndex((doc) => doc.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= docs.length) {
    return false;
  }
  const collection = await documentsCollection();
  // Normalise orders to their positions first so swapping is always meaningful.
  const operations = docs.map((doc, position) => ({
    updateOne: { filter: { _id: new ObjectId(doc.id) }, update: { $set: { order: position === index ? target : position === target ? index : position } } },
  }));
  await collection.bulkWrite(operations);
  return true;
}

export async function deleteDocument(id: string): Promise<DocumentRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await documentsCollection();
  const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });
  return result ? toRecord(result) : null;
}
