"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteGalleryItemAction, moveGalleryItemAction, setGalleryItemVisibleAction, type ActionResult } from "./actions";

type Props = { id: string; title: string; visible: boolean; isFirst: boolean; isLast: boolean };

export default function GalleryRowActions({ id, title, visible, isFirst, isLast }: Props) {
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
      <Link className="admBtn admBtnSmall" href={`/admin/gallery/${id}`}>
        Edit
      </Link>
      <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={() => run(() => moveGalleryItemAction(id, -1))} disabled={pending || isFirst} aria-label={`Move ${title} up`}>
        Up
      </button>
      <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={() => run(() => moveGalleryItemAction(id, 1))} disabled={pending || isLast} aria-label={`Move ${title} down`}>
        Down
      </button>
      <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={() => run(() => setGalleryItemVisibleAction(id, !visible))} disabled={pending}>
        {visible ? "Hide" : "Show"}
      </button>
      <button
        type="button"
        className="admBtn admBtnSmall admBtnDanger"
        onClick={() => {
          if (window.confirm(`Remove "${title}" from the gallery?`)) {
            run(() => deleteGalleryItemAction(id));
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
