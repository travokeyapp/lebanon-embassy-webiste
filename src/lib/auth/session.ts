import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionUser,
} from "@/lib/auth/session-token";
import { canAccess, normalizeAreas, type Area } from "@/lib/auth/permissions";
import { findUserById, type UserDoc } from "@/lib/auth/users";

export type { SessionUser } from "@/lib/auth/session-token";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function sessionUserFromDoc(user: UserDoc): SessionUser {
  return {
    id: user._id.toHexString(),
    email: user.email,
    name: user.name,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
    areas: normalizeAreas(user.areas),
  };
}

// Only callable from Server Actions and Route Handlers.
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_TTL_SECONDS });
}

export async function issueSessionCookie(user: UserDoc): Promise<void> {
  await setSessionCookie(await createSessionToken(sessionUserFromDoc(user)));
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

// The session as stated by the signed cookie. Cheap; no database access.
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

// The session checked against the database: the user must still exist, be
// active, and not have had their password or role changed since sign-in.
// If the database is unreachable the cookie alone is trusted so that an
// outage does not lock staff out of pages that work without it.
export async function getVerifiedSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  let user: UserDoc | null;
  try {
    user = await findUserById(session.id);
  } catch (error) {
    console.error("Session check could not reach the database:", error);
    return session;
  }
  if (!user || !user.active || (user.tokenVersion ?? 0) !== session.tokenVersion) {
    return null;
  }
  return sessionUserFromDoc(user);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireActiveUser(): Promise<SessionUser> {
  const session = await getVerifiedSession();
  if (!session) {
    redirect("/admin/logout?reason=signed-out");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireActiveUser();
  if (session.role !== "admin") {
    redirect("/admin?denied=1");
  }
  return session;
}

// For pages: the signed-in person must be allowed to change this section.
export async function requireArea(area: Area): Promise<SessionUser> {
  const session = await requireActiveUser();
  if (!canAccess(session, area)) {
    redirect("/admin?denied=1");
  }
  return session;
}

export type Authorization = { ok: true; session: SessionUser } | { ok: false; error: string };

// For server actions: same check, but reported back instead of redirecting.
export async function authorizeArea(area: Area): Promise<Authorization> {
  const session = await getVerifiedSession();
  if (!session) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }
  if (!canAccess(session, area)) {
    return { ok: false, error: "You do not have permission to change this section. Ask an administrator." };
  }
  return { ok: true, session };
}
