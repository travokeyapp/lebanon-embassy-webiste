"use client";

import { useActionState } from "react";
import { createUserAction, type CreateUserState } from "./actions";

const initialState: CreateUserState = {};

export default function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <section className="admCard">
      <h2 className="admCardTitle">Add a staff member</h2>
      <p className="admMuted">A password is generated for them. It is shown once, so copy it and pass it on securely.</p>
      <form action={formAction} className="admForm admFormInline" key={state.created?.email ?? "new"}>
        <label className="admField admFieldGrow">
          <span className="admFieldLabel">Name</span>
          <input className="admInput" type="text" name="name" required autoComplete="off" />
        </label>
        <label className="admField admFieldGrow">
          <span className="admFieldLabel">Email</span>
          <input className="admInput" type="email" name="email" required autoComplete="off" />
        </label>
        <label className="admField">
          <span className="admFieldLabel">Role</span>
          <select className="admInput admSelect" name="role" defaultValue="editor">
            <option value="editor">Editor (manages content)</option>
            <option value="admin">Administrator (also manages staff)</option>
          </select>
        </label>
        <button className="admBtn admBtnPrimary" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      {state.error ? (
        <p className="admAlert admAlertError" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.created ? (
        <div className="admCredentials" role="status">
          <strong>Account created for {state.created.name}.</strong>
          <p>Share these sign-in details with them. The password will not be shown again.</p>
          <dl>
            <dt>Sign in at</dt>
            <dd className="admMono">/admin/login</dd>
            <dt>Email</dt>
            <dd className="admMono">{state.created.email}</dd>
            <dt>Password</dt>
            <dd className="admMono admCredentialSecret">{state.created.password}</dd>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
