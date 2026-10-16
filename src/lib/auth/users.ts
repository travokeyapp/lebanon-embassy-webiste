import { randomBytes } from "node:crypto";
import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import { hashPassword, validateNewPassword } from "@/lib/auth/password";
import { normalizeAreas, type Area, type AreaGrant } from "@/lib/auth/permissions";

export const USER_ROLES = ["admin", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  // Sections an editor may change. Absent means every section.
  areas?: Area[];
  // Incremented whenever the password, role, active flag or permissions
  // change, which invalidates every session token issued before the change.
  tokenVersion?: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  areas: AreaGrant;
  tokenVersion: number;
  createdAt: string;
  lastLoginAt: string | null;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function toUserRecord(doc: WithId<UserDoc>): UserRecord {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    active: doc.active,
    areas: normalizeAreas(doc.areas),
    tokenVersion: doc.tokenVersion ?? 0,
    createdAt: doc.createdAt.toISOString(),
    lastLoginAt: doc.lastLoginAt ? doc.lastLoginAt.toISOString() : null,
  };
}

// A random password that satisfies the password rules.
export function generatePassword(): string {
  for (;;) {
    const candidate = randomBytes(12).toString("base64url");
    if (!validateNewPassword(candidate)) {
      return candidate;
    }
  }
}

export async function usersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>("users");
}

export async function ensureUserIndexes(): Promise<void> {
  const users = await usersCollection();
  await users.createIndex({ email: 1 }, { unique: true });
}

export async function listUsers(): Promise<UserRecord[]> {
  const users = await usersCollection();
  const docs = await users.find({}).sort({ createdAt: 1 }).toArray();
  return docs.map(toUserRecord);
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

export async function countActiveAdmins(): Promise<number> {
  const users = await usersCollection();
  return users.countDocuments({ role: "admin", active: true });
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  // Omit (or pass null) for every section.
  areas?: Area[] | null;
}): Promise<UserDoc> {
  await ensureUserIndexes();
  const users = await usersCollection();
  const now = new Date();
  const doc: Omit<UserDoc, "_id"> = {
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    role: input.role,
    active: true,
    ...(input.areas ? { areas: input.areas } : {}),
    tokenVersion: 0,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };
  const result = await users.insertOne(doc as UserDoc);
  return { ...doc, _id: result.insertedId };
}

export async function setUserPassword(userId: ObjectId, password: string): Promise<void> {
  const users = await usersCollection();
  await users.updateOne(
    { _id: userId },
    { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() }, $inc: { tokenVersion: 1 } },
  );
}

export async function setUserActive(userId: ObjectId, active: boolean): Promise<void> {
  const users = await usersCollection();
  await users.updateOne({ _id: userId }, { $set: { active, updatedAt: new Date() }, $inc: { tokenVersion: 1 } });
}

export async function setUserRole(userId: ObjectId, role: UserRole): Promise<void> {
  const users = await usersCollection();
  await users.updateOne({ _id: userId }, { $set: { role, updatedAt: new Date() }, $inc: { tokenVersion: 1 } });
}

// null restores access to every section.
export async function setUserAreas(userId: ObjectId, areas: Area[] | null): Promise<void> {
  const users = await usersCollection();
  await users.updateOne(
    { _id: userId },
    areas
      ? { $set: { areas, updatedAt: new Date() }, $inc: { tokenVersion: 1 } }
      : { $unset: { areas: "" }, $set: { updatedAt: new Date() }, $inc: { tokenVersion: 1 } },
  );
}

export async function recordLogin(userId: ObjectId): Promise<void> {
  const users = await usersCollection();
  await users.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
}
