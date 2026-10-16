"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { clearFailedLogins, isLoginBlocked, recordFailedLogin } from "@/lib/auth/login-rate-limit";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { createSessionToken } from "@/lib/auth/session-token";
import { findUserByEmail, recordLogin } from "@/lib/auth/users";

export type LoginState = { error?: string };

async function clientKey(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : requestHeaders.get("x-real-ip");
  return ip || "unknown";
}

function safeNextPath(value: string): string {
  if (value.startsWith("/admin") && !value.startsWith("//") && value !== "/admin/login") {
    return value;
  }
  return "/admin/news";
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const key = await clientKey();
  if (isLoginBlocked(key)) {
    return { error: "Too many failed attempts. Please wait 15 minutes and try again." };
  }

  let user;
  try {
    user = await findUserByEmail(email);
  } catch (error) {
    console.error("Login lookup failed:", error);
    return { error: "The database is not reachable right now. Please try again shortly." };
  }

  const passwordOk = await verifyPassword(password, user?.passwordHash);
  if (!user || !passwordOk || !user.active) {
    recordFailedLogin(key);
    return { error: "Incorrect email or password." };
  }

  clearFailedLogins(key);
  await recordLogin(user._id);

  const sessionUser = { id: user._id.toHexString(), email: user.email, name: user.name, role: user.role };
  await setSessionCookie(await createSessionToken(sessionUser));
  await logAudit({
    userId: sessionUser.id,
    userEmail: sessionUser.email,
    action: "auth.login",
    entity: "user",
    entityId: sessionUser.id,
  });

  redirect(nextPath);
}
