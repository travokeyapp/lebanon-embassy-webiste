"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AREAS, AREA_LABELS, describeAreas, type Area } from "@/lib/auth/permissions";
import type { UserRecord } from "@/lib/auth/users";
import { setUserAreasAction } from "./actions";

// Shows what a staff member may change; administrators can adjust it for editors.
export default function UserPermissions({ user, canEdit }: { user: UserRecord; canEdit: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Area[]>(() => (user.areas === "all" ? [...AREAS] : user.areas));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (area: Area, checked: boolean) =>
    setSelected((current) => (checked ? [...new Set([...current, area])] : current.filter((item) => item !== area)));

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await setUserAreasAction(user.id, selected);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <div className="admPermissions">
        <span>{describeAreas(user)}</span>
        {canEdit && user.role === "editor" ? (
          <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={() => setEditing(true)}>
            Change
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="admPermissions admPermissionsEditing">
      <div className="admCheckGrid">
        {AREAS.map((area) => (
          <label className="admCheck admCheckInline" key={area}>
            <input type="checkbox" checked={selected.includes(area)} onChange={(event) => toggle(area, event.target.checked)} disabled={pending} />
            <span>{AREA_LABELS[area].label}</span>
          </label>
        ))}
      </div>
      <div className="admRowActions">
        <button type="button" className="admBtn admBtnSmall admBtnPrimary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save permissions"}
        </button>
        <button
          type="button"
          className="admBtn admBtnSmall admBtnGhost"
          onClick={() => {
            setEditing(false);
            setSelected(user.areas === "all" ? [...AREAS] : user.areas);
          }}
          disabled={pending}
        >
          Cancel
        </button>
      </div>
      <small className="admMuted">Saving signs this person out so the change applies on their next sign-in.</small>
      {error ? (
        <span className="admInlineError" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
