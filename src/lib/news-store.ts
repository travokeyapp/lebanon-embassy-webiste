import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { NewsInput, NewsStatus } from "@/lib/news-schema";

// MongoDB-backed store for news items. No Next.js imports here so the
// maintenance scripts in /scripts can use it too.

export type LocalizedText = { en: string; ar: string };

export type NewsImage = {
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
};

export type NewsAttachment = {
  href: string;
  label: LocalizedText;
};

export type NewsDoc = {
  slug: string;
  date: string; // YYYY-MM-DD
  status: NewsStatus;
  title: LocalizedText;
  excerpt: LocalizedText;
  image: NewsImage | null;
  gallery: NewsImage[];
  attachment: NewsAttachment | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  createdBy: string;
  updatedBy: string;
};

// Plain, JSON-serializable shape handed to pages, caches and client components.
export type NewsRecord = Omit<NewsDoc, "createdAt" | "updatedAt" | "publishedAt"> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`A news item with the slug "${slug}" already exists.`);
    this.name = "SlugTakenError";
  }
}

const NEWS_SORT = { date: -1, createdAt: -1 } as const;

type GlobalWithIndexes = typeof globalThis & { __embassyNewsIndexes?: Promise<void> };

export async function newsCollection(): Promise<Collection<NewsDoc>> {
  const db = await getDb();
  return db.collection<NewsDoc>("news");
}

export async function ensureNewsIndexes(): Promise<void> {
  const store = globalThis as GlobalWithIndexes;
  if (!store.__embassyNewsIndexes) {
    store.__embassyNewsIndexes = (async () => {
      const news = await newsCollection();
      await news.createIndex({ slug: 1 }, { unique: true });
      await news.createIndex({ status: 1, date: -1, createdAt: -1 });
    })().catch((error) => {
      store.__embassyNewsIndexes = undefined;
      throw error;
    });
  }
  return store.__embassyNewsIndexes;
}

function toRecord(doc: WithId<NewsDoc>): NewsRecord {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    date: doc.date,
    status: doc.status,
    title: doc.title,
    excerpt: doc.excerpt,
    image: doc.image ?? null,
    gallery: doc.gallery ?? [],
    attachment: doc.attachment ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

export async function listPublishedNews(): Promise<NewsRecord[]> {
  const news = await newsCollection();
  const docs = await news.find({ status: "published" }).sort(NEWS_SORT).toArray();
  return docs.map(toRecord);
}

export async function listAllNews(): Promise<NewsRecord[]> {
  const news = await newsCollection();
  const docs = await news.find({}).sort(NEWS_SORT).toArray();
  return docs.map(toRecord);
}

export async function getNewsById(id: string): Promise<NewsRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const news = await newsCollection();
  const doc = await news.findOne({ _id: new ObjectId(id) });
  return doc ? toRecord(doc) : null;
}

export async function insertNews(input: NewsInput, actor: string): Promise<NewsRecord> {
  await ensureNewsIndexes();
  const news = await newsCollection();
  const now = new Date();
  const doc: NewsDoc = {
    ...input,
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === "published" ? now : null,
    createdBy: actor,
    updatedBy: actor,
  };
  try {
    const result = await news.insertOne(doc);
    return toRecord({ ...doc, _id: result.insertedId });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new SlugTakenError(input.slug);
    }
    throw error;
  }
}

export async function updateNews(id: string, input: NewsInput, actor: string): Promise<NewsRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  await ensureNewsIndexes();
  const news = await newsCollection();
  const _id = new ObjectId(id);
  const existing = await news.findOne({ _id });
  if (!existing) {
    return null;
  }
  const now = new Date();
  const publishedAt =
    input.status === "published" ? (existing.publishedAt ?? now) : existing.publishedAt;
  try {
    const result = await news.findOneAndUpdate(
      { _id },
      { $set: { ...input, updatedAt: now, updatedBy: actor, publishedAt } },
      { returnDocument: "after" },
    );
    return result ? toRecord(result) : null;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new SlugTakenError(input.slug);
    }
    throw error;
  }
}

export async function setNewsStatus(id: string, status: NewsStatus, actor: string): Promise<NewsRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const news = await newsCollection();
  const _id = new ObjectId(id);
  const existing = await news.findOne({ _id });
  if (!existing) {
    return null;
  }
  const now = new Date();
  const publishedAt = status === "published" ? (existing.publishedAt ?? now) : existing.publishedAt;
  const result = await news.findOneAndUpdate(
    { _id },
    { $set: { status, updatedAt: now, updatedBy: actor, publishedAt } },
    { returnDocument: "after" },
  );
  return result ? toRecord(result) : null;
}

export async function deleteNews(id: string): Promise<NewsRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const news = await newsCollection();
  const result = await news.findOneAndDelete({ _id: new ObjectId(id) });
  return result ? toRecord(result) : null;
}
