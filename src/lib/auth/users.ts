import { ObjectId, type Collection } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import { hashPassword } from "@/lib/auth/password";

export const USER_ROLES = ["admin", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function usersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>("users");
}

export async function ensureUserIndexes(): Promise<void> {
  const users = await usersCollection();
  await users.createIndex({ email: 1 }, { unique: true });
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const users = await usersCollection();
  return users.findOne({ email: normalizeEmail(email) });
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const users = await usersCollection();
  return users.findOne({ _id: new ObjectId(id) });
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}): Promise<UserDoc> {
  const users = await usersCollection();
  const now = new Date();
  const doc: Omit<UserDoc, "_id"> = {
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    role: input.role,
    active: true,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };
  const result = await users.insertOne(doc as UserDoc);
  return { ...doc, _id: result.insertedId };
}

export async function setUserPassword(userId: ObjectId, password: string): Promise<void> {
  const users = await usersCollection();
  await users.updateOne({ _id: userId }, { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() } });
}

export async function recordLogin(userId: ObjectId): Promise<void> {
  const users = await usersCollection();
  await users.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
}
