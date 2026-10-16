"use client";

import { useActionState, useState } from "react";
import { AREAS, AREA_LABELS } from "@/lib/auth/permissions";
import { createUserAction, type CreateUserState } from "./actions";

const initialState: CreateUserState = {};

export default function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  const [role, setRole] = useState<"editor" | "admin">("editor");

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
          <select className="admInput admSelect" name="role" value={role} onChange={(event) => setRole(event.target.value as "editor" | "admin")}>
            <option value="editor">Editor (manages content)</option>
            <option value="admin">Administrator (also manages staff)</option>
          </select>
        </label>
        {role === "editor" ? (
          <fieldset className="admFieldset admFieldWide">
            <legend className="admFieldLabel">Sections this editor may change</legend>
            <div className="admCheckGrid">
              {AREAS.map((area) => (
                <label className="admCheck admCheckInline" key={area}>
                  <input type="checkbox" name="areas" value={area} defaultChecked />
                  <span>
                    <strong>{AREA_LABELS[area].label}</strong>
                    <small className="admHint">{AREA_LABELS[area].description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="admMuted admFieldWide">Administrators can change everything and manage staff accounts.</p>
        )}
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
