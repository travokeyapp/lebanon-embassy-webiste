"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAnnouncementAction, setAnnouncementActiveAction, type ActionResult } from "./actions";

export default function AnnouncementRowActions({ id, active, text }: { id: string; active: boolean; text: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<ActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="admRowActions">
      <Link className="admBtn admBtnSmall" href={`/admin/announcements/${id}`}>
        Edit
      </Link>
      <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={() => run(() => setAnnouncementActiveAction(id, !active))} disabled={pending}>
        {active ? "Turn off" : "Turn on"}
      </button>
      <button
        type="button"
        className="admBtn admBtnSmall admBtnDanger"
        onClick={() => {
          if (window.confirm(`Delete this announcement?\n\n"${text}"`)) {
            run(() => deleteAnnouncementAction(id));
          }
        }}
        disabled={pending}
      >
        Delete
      </button>
      {error ? (
        <span className="admInlineError" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
