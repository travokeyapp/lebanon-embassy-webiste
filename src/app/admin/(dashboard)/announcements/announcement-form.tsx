"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BilingualField, FieldError, PlainField, emptyLocalized, type FieldErrors, type Localized } from "@/components/admin/fields";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes";
import { announcementInputSchema, type AnnouncementRecord, type AnnouncementTone } from "@/lib/content/announcements-schema";
import { collectFieldErrors } from "@/lib/news-schema";
import { saveAnnouncementAction } from "./actions";

type FormValues = {
  text: Localized;
  tone: AnnouncementTone;
  linkHref: string;
  linkLabel: Localized;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

function initialValues(record: AnnouncementRecord | null): FormValues {
  return {
    text: record ? { ...record.text } : emptyLocalized(),
    tone: record?.tone ?? "info",
    linkHref: record?.linkHref ?? "",
    linkLabel: record ? { ...record.linkLabel } : emptyLocalized(),
    startsAt: record?.startsAt ?? "",
    endsAt: record?.endsAt ?? "",
    active: record?.active ?? true,
  };
}

export default function AnnouncementForm({ initial }: { initial: AnnouncementRecord | null }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() => initialValues(initial));
  const [snapshot] = useState(() => JSON.stringify(initialValues(initial)));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(values) !== snapshot;
  useUnsavedChangesWarning(dirty && !pending);

  const update = (patch: Partial<FormValues>) => setValues((current) => ({ ...current, ...patch }));

  const save = () => {
    setFormError(null);
    const parsed = announcementInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error.issues));
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveAnnouncementAction(initial?.id ?? null, parsed.data);
      if (!result.ok) {
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
        return;
      }
      router.push("/admin/announcements?saved=1");
      router.refresh();
    });
  };

  return (
    <form
      className="admForm admNewsForm"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      {formError ? (
        <p className="admAlert admAlertError" role="alert">
          {formError}
        </p>
      ) : null}

      <section className="admCard">
        <h2 className="admCardTitle">Message</h2>
        <BilingualField
          label="Text"
          hint="One or two sentences. Shown in a strip under the site header on every page."
          value={values.text}
          minRows={2}
          onChange={(lang, text) => update({ text: { ...values.text, [lang]: text } })}
          errors={errors}
          errorKey="text"
        />
        <div className="admField">
          <span className="admFieldLabel">Style</span>
          <div className="admRadioRow">
            <label className="admRadio">
              <input type="radio" name="tone" checked={values.tone === "info"} onChange={() => update({ tone: "info" })} />
              <span>Information (green)</span>
            </label>
            <label className="admRadio">
              <input type="radio" name="tone" checked={values.tone === "alert"} onChange={() => update({ tone: "alert" })} />
              <span>Important (red, bold)</span>
            </label>
          </div>
        </div>
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">Link (optional)</h2>
        <PlainField
          label="Link address"
          hint="A page on this site such as /contact, or a full https:// address."
          value={values.linkHref}
          onChange={(value) => update({ linkHref: value })}
          mono
          error={errors.linkHref}
        />
        {values.linkHref ? (
          <BilingualField
            label="Link text"
            value={values.linkLabel}
            minRows={1}
            singleLine
            onChange={(lang, text) => update({ linkLabel: { ...values.linkLabel, [lang]: text } })}
            errors={errors}
            errorKey="linkLabel"
          />
        ) : null}
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">When to show it</h2>
        <div className="admRow">
          <label className="admField">
            <span className="admFieldLabel">From (optional)</span>
            <input className="admInput" type="date" value={values.startsAt} onChange={(event) => update({ startsAt: event.target.value })} />
            <FieldError message={errors.startsAt} />
          </label>
          <label className="admField">
            <span className="admFieldLabel">Until (optional, inclusive)</span>
            <input className="admInput" type="date" value={values.endsAt} onChange={(event) => update({ endsAt: event.target.value })} />
            <FieldError message={errors.endsAt} />
          </label>
        </div>
        <label className="admCheck">
          <input type="checkbox" checked={values.active} onChange={(event) => update({ active: event.target.checked })} />
          <span>Switched on. Turn off to hide it without deleting it.</span>
        </label>
      </section>

      <div className="admFormBar">
        <div className="admFormBarActions">
          <Link href="/admin/announcements" className="admBtn admBtnGhost">
            Cancel
          </Link>
        </div>
        <div className="admFormBarActions">
          {dirty && !pending ? <span className="admUnsavedHint">Unsaved changes</span> : null}
          <button type="submit" className="admBtn admBtnPrimary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
