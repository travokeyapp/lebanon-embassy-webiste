"use server";

import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit";
import { isArea, type Area } from "@/lib/auth/permissions";
import { getVerifiedSession, type SessionUser } from "@/lib/auth/session";
import {
  USER_ROLES,
  countActiveAdmins,
  createUser,
  findUserByEmail,
  findUserById,
  generatePassword,
  isValidEmail,
  normalizeEmail,
  setUserActive,
  setUserAreas,
  setUserPassword,
  setUserRole,
  type UserRole,
} from "@/lib/auth/users";

export type CreateUserState = {
  error?: string;
  created?: { name: string; email: string; role: UserRole; password: string };
};

function parseAreas(values: FormDataEntryValue[]): Area[] {
  return values.map(String).filter(isArea);
}

export type UserActionResult = { ok: true; password?: string } | { ok: false; error: string };

const NOT_ALLOWED = "Only administrators can manage staff accounts.";

async function requireAdminSession(): Promise<SessionUser | null> {
  const session = await getVerifiedSession();
  return session && session.role === "admin" ? session : null;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

export async function createUserAction(_previous: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const session = await requireAdminSession();
  if (!session) {
    return { error: NOT_ALLOWED };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const roleValue = String(formData.get("role") ?? "editor");
  const role: UserRole = (USER_ROLES as readonly string[]).includes(roleValue) ? (roleValue as UserRole) : "editor";
  // Administrators always have everything; for editors the ticked sections apply.
  const areas = role === "editor" ? parseAreas(formData.getAll("areas")) : null;

  if (name.length < 2) {
    return { error: "Enter the person's name." };
  }
  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  try {
    if (await findUserByEmail(email)) {
      return { error: "There is already an account with that email address." };
    }
    const password = generatePassword();
    const user = await createUser({ name, email, password, role, areas });
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: "user.create",
      entity: "user",
      entityId: user._id.toHexString(),
      summary: `${email} (${role}${areas ? `: ${areas.join(", ") || "no sections"}` : ""})`,
    });
    return { created: { name, email, role, password } };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: "There is already an account with that email address." };
    }
    console.error("createUserAction failed:", error);
    return { error: "Could not create the account. Please try again." };
  }
}

async function loadTarget(id: string): Promise<{ ok: true; session: SessionUser; target: NonNullable<Awaited<ReturnType<typeof findUserById>>> } | { ok: false; error: string }> {
  const session = await requireAdminSession();
  if (!session) {
    return { ok: false, error: NOT_ALLOWED };
  }
  if (!ObjectId.isValid(id)) {
    return { ok: false, error: "Unknown account." };
  }
  const target = await findUserById(id);
  if (!target) {
    return { ok: false, error: "This account no longer exists." };
  }
  return { ok: true, session, target };
}

export async function resetUserPasswordAction(id: string): Promise<UserActionResult> {
  try {
    const loaded = await loadTarget(id);
    if (!loaded.ok) {
      return loaded;
    }
    const password = generatePassword();
    await setUserPassword(loaded.target._id, password);
    await logAudit({
      userId: loaded.session.id,
      userEmail: loaded.session.email,
      action: "user.password-reset",
      entity: "user",
      entityId: id,
      summary: loaded.target.email,
    });
    return { ok: true, password };
  } catch (error) {
    console.error("resetUserPasswordAction failed:", error);
    return { ok: false, error: "Could not reset the password. Please try again." };
  }
}

export async function setUserActiveAction(id: string, active: boolean): Promise<UserActionResult> {
  try {
    const loaded = await loadTarget(id);
    if (!loaded.ok) {
      return loaded;
    }
    if (loaded.session.id === id) {
      return { ok: false, error: "You cannot deactivate your own account." };
    }
    if (!active && loaded.target.role === "admin" && loaded.target.active && (await countActiveAdmins()) <= 1) {
      return { ok: false, error: "At least one administrator must stay active." };
    }
    await setUserActive(loaded.target._id, active);
    await logAudit({
      userId: loaded.session.id,
      userEmail: loaded.session.email,
      action: active ? "user.activate" : "user.deactivate",
      entity: "user",
      entityId: id,
      summary: loaded.target.email,
    });
    return { ok: true };
  } catch (error) {
    console.error("setUserActiveAction failed:", error);
    return { ok: false, error: "Could not update the account. Please try again." };
  }
}

export async function setUserRoleAction(id: string, role: UserRole): Promise<UserActionResult> {
  if (!(USER_ROLES as readonly string[]).includes(role)) {
    return { ok: false, error: "Unknown role." };
  }
  try {
    const loaded = await loadTarget(id);
    if (!loaded.ok) {
      return loaded;
    }
    if (loaded.session.id === id) {
      return { ok: false, error: "You cannot change your own role." };
    }
    if (role === "editor" && loaded.target.role === "admin" && loaded.target.active && (await countActiveAdmins()) <= 1) {
      return { ok: false, error: "At least one administrator must remain." };
    }
    await setUserRole(loaded.target._id, role);
    await logAudit({
      userId: loaded.session.id,
      userEmail: loaded.session.email,
      action: "user.role-change",
      entity: "user",
      entityId: id,
      summary: `${loaded.target.email} → ${role}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("setUserRoleAction failed:", error);
    return { ok: false, error: "Could not update the role. Please try again." };
  }
}

export async function setUserAreasAction(id: string, rawAreas: unknown): Promise<UserActionResult> {
  const areas = Array.isArray(rawAreas) ? rawAreas.filter(isArea) : null;
  if (!areas) {
    return { ok: false, error: "Invalid permissions." };
  }
  try {
    const loaded = await loadTarget(id);
    if (!loaded.ok) {
      return loaded;
    }
    if (loaded.target.role !== "editor") {
      return { ok: false, error: "Administrators always have access to everything." };
    }
    await setUserAreas(loaded.target._id, areas);
    await logAudit({
      userId: loaded.session.id,
      userEmail: loaded.session.email,
      action: "user.permissions",
      entity: "user",
      entityId: id,
      summary: `${loaded.target.email}: ${areas.join(", ") || "no sections"}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("setUserAreasAction failed:", error);
    return { ok: false, error: "Could not update the permissions. Please try again." };
  }
}
