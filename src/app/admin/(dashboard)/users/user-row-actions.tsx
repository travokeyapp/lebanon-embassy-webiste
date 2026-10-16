"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { UserRecord } from "@/lib/auth/users";
import { resetUserPasswordAction, setUserActiveAction, setUserRoleAction, type UserActionResult } from "./actions";

export default function UserRowActions({ user, isSelf }: { user: UserRecord; isSelf: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const run = (action: () => Promise<UserActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.password) {
        setNewPassword(result.password);
      }
      router.refresh();
    });
  };

  const resetPassword = () => {
    if (!window.confirm(`Generate a new password for ${user.name}?\n\nTheir current password stops working immediately.`)) {
      return;
    }
    run(() => resetUserPasswordAction(user.id));
  };

  const toggleActive = () => {
    const question = user.active
      ? `Deactivate ${user.name}?\n\nThey will be signed out and cannot sign in until reactivated.`
      : `Reactivate ${user.name}?`;
    if (!window.confirm(question)) {
      return;
    }
    run(() => setUserActiveAction(user.id, !user.active));
  };

  const toggleRole = () => {
    const nextRole = user.role === "admin" ? "editor" : "admin";
    if (!window.confirm(`Change ${user.name}'s role to ${nextRole}?`)) {
      return;
    }
    run(() => setUserRoleAction(user.id, nextRole));
  };

  if (isSelf) {
    return <span className="admMuted">This is you. Use My account to change your password.</span>;
  }

  return (
    <div className="admRowActionsStack">
      <div className="admRowActions">
        <button type="button" className="admBtn admBtnSmall" onClick={resetPassword} disabled={pending}>
          Reset password
        </button>
        <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={toggleRole} disabled={pending}>
          {user.role === "admin" ? "Make editor" : "Make administrator"}
        </button>
        <button
          type="button"
          className={`admBtn admBtnSmall ${user.active ? "admBtnDanger" : "admBtnGhost"}`}
          onClick={toggleActive}
          disabled={pending}
        >
          {user.active ? "Deactivate" : "Reactivate"}
        </button>
      </div>
      {error ? (
        <span className="admInlineError" role="alert">
          {error}
        </span>
      ) : null}
      {newPassword ? (
        <div className="admCredentials admCredentialsCompact" role="status">
          <span>
            New password for {user.email}: <code className="admCredentialSecret">{newPassword}</code>
          </span>
          <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={() => setNewPassword(null)}>
            Hide
          </button>
        </div>
      ) : null}
    </div>
  );
}
