"use client";

import { useActionState } from "react";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { changePasswordAction, type PasswordState } from "../actions";

const initialState: PasswordState = {};

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="admForm admFormNarrow">
      <label className="admField">
        <span className="admFieldLabel">Current password</span>
        <input className="admInput" type="password" name="current" autoComplete="current-password" required />
      </label>
      <label className="admField">
        <span className="admFieldLabel">New password</span>
        <input
          className="admInput"
          type="password"
          name="next"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <small className="admHint">At least {MIN_PASSWORD_LENGTH} characters, with letters and numbers.</small>
      </label>
      <label className="admField">
        <span className="admFieldLabel">Repeat new password</span>
        <input className="admInput" type="password" name="confirm" autoComplete="new-password" required />
      </label>
      {state.error ? (
        <p className="admAlert admAlertError" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="admAlert admAlertSuccess" role="status">
          {state.success}
        </p>
      ) : null}
      <button className="admBtn admBtnPrimary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
