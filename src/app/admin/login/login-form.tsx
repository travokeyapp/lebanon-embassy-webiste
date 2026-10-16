"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="admForm">
      <input type="hidden" name="next" value={nextPath} />
      <label className="admField">
        <span className="admFieldLabel">Email</span>
        <input className="admInput" type="email" name="email" autoComplete="username" required />
      </label>
      <label className="admField">
        <span className="admFieldLabel">Password</span>
        <input className="admInput" type="password" name="password" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p className="admAlert admAlertError" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="admBtn admBtnPrimary admBtnBlock" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
