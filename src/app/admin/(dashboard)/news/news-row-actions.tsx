"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { NewsStatus } from "@/lib/news-schema";
import { deleteNewsAction, setNewsStatusAction, type ActionResult } from "./actions";

type Props = {
  id: string;
  slug: string;
  status: NewsStatus;
  title: string;
};

export default function NewsRowActions({ id, slug, status, title }: Props) {
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

  const toggleStatus = () => run(() => setNewsStatusAction(id, status === "published" ? "draft" : "published"));

  const remove = () => {
    if (!window.confirm(`Delete "${title || slug}"?\n\nThis removes it from the website and cannot be undone.`)) {
      return;
    }
    run(() => deleteNewsAction(id));
  };

  return (
    <div className="admRowActions">
      <Link className="admBtn admBtnSmall" href={`/admin/news/${id}`}>
        Edit
      </Link>
      {status === "published" ? (
        <a className="admBtn admBtnSmall admBtnGhost" href={`/en/news?item=${slug}#${slug}`} target="_blank" rel="noreferrer">
          View
        </a>
      ) : null}
      <button type="button" className="admBtn admBtnSmall admBtnGhost" onClick={toggleStatus} disabled={pending}>
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button type="button" className="admBtn admBtnSmall admBtnDanger" onClick={remove} disabled={pending}>
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
