"use server";

import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { validateNewPassword, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, getSession, getVerifiedSession, issueSessionCookie } from "@/lib/auth/session";
import { findUserById, setUserPassword } from "@/lib/auth/users";

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  await clearSessionCookie();
  if (session) {
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      action: "auth.logout",
      entity: "user",
      entityId: session.id,
    });
  }
  redirect("/admin/login");
}

export type PasswordState = { error?: string; success?: string };

export async function changePasswordAction(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await getVerifiedSession();
  if (!session) {
    redirect("/admin/login");
  }

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await findUserById(session.id);
  if (!user || !user.active) {
    redirect("/admin/login");
  }

  if (!(await verifyPassword(current, user.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  const problem = validateNewPassword(next);
  if (problem) {
    return { error: problem };
  }
  if (next !== confirm) {
    return { error: "New passwords do not match." };
  }
  if (next === current) {
    return { error: "Choose a password different from the current one." };
  }

  await setUserPassword(user._id, next);
  // The password change invalidates every session, including this one, so re-issue it.
  const refreshed = await findUserById(user._id.toHexString());
  if (refreshed) {
    await issueSessionCookie(refreshed);
  }
  await logAudit({
    userId: session.id,
    userEmail: session.email,
    action: "auth.password-change",
    entity: "user",
    entityId: session.id,
  });

  return { success: "Password updated." };
}
