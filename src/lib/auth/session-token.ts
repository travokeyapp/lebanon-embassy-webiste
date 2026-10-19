import { SignJWT, jwtVerify } from "jose";
import { normalizeAreas, type AreaGrant } from "@/lib/auth/permissions";

// Edge-safe: used by the middleware as well as server code. No Node-only imports here.

export const SESSION_COOKIE = "embassy_admin_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

const ISSUER = "lebanon-embassy-admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  // Must match the user's current tokenVersion in the database; see users.ts.
  tokenVersion: number;
  // Sections this person may change; administrators always have everything.
  areas: AreaGrant;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role, v: user.tokenVersion, a: user.areas })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { issuer: ISSUER, algorithms: ["HS256"] });
    const { sub, email, name, role, v, a } = payload;
    if (typeof sub !== "string" || typeof email !== "string" || typeof name !== "string") {
      return null;
    }
    if (role !== "admin" && role !== "editor") {
      return null;
    }
    return { id: sub, email, name, role, tokenVersion: typeof v === "number" ? v : 0, areas: normalizeAreas(a) };
  } catch {
    return null;
  }
}
