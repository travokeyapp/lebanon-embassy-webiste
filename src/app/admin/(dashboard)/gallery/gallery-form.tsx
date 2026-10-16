"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BilingualField, emptyLocalized, type FieldErrors, type Localized } from "@/components/admin/fields";
import ImagePicker, { type ImageValue } from "@/components/admin/image-picker";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes";
import { GALLERY_COLLECTIONS, GALLERY_COLLECTION_LABELS, galleryInputSchema, type GalleryCollection, type GalleryRecord } from "@/lib/content/gallery-schema";
import { collectFieldErrors } from "@/lib/news-schema";
import { saveGalleryItemAction } from "./actions";

type FormValues = {
  image: ImageValue | null;
  collection: GalleryCollection;
  date: Localized;
  title: Localized;
  caption: Localized;
  visible: boolean;
};

function initialValues(record: GalleryRecord | null): FormValues {
  return {
    image: record?.image ? { ...record.image, alt: { ...record.image.alt } } : null,
    collection: record?.collection ?? "diplomatic",
    date: record ? { ...record.date } : emptyLocalized(),
    title: record ? { ...record.title } : emptyLocalized(),
    caption: record ? { ...record.caption } : emptyLocalized(),
    visible: record?.visible ?? true,
  };
}

export default function GalleryForm({ initial }: { initial: GalleryRecord | null }) {
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
    const parsed = galleryInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error.issues));
      setFormError("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveGalleryItemAction(initial?.id ?? null, parsed.data);
      if (!result.ok) {
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
        return;
      }
      router.push("/admin/gallery?saved=1");
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
        <h2 className="admCardTitle">Photo</h2>
        <ImagePicker
          value={values.image}
          onChange={(image) => update({ image })}
          onError={(text) => setFormError(text)}
          disabled={pending}
          folder="gallery"
          error={errors.image}
        />
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">Details</h2>
        <BilingualField label="Title" value={values.title} singleLine minRows={1} onChange={(lang, text) => update({ title: { ...values.title, [lang]: text } })} errors={errors} errorKey="title" />
        <BilingualField label="Caption" value={values.caption} minRows={2} onChange={(lang, text) => update({ caption: { ...values.caption, [lang]: text } })} errors={errors} errorKey="caption" />
        <BilingualField
          label="Date label"
          hint="Free text shown above the title, for example: October 2026."
          value={values.date}
          singleLine
          minRows={1}
          onChange={(lang, text) => update({ date: { ...values.date, [lang]: text } })}
          errors={errors}
          errorKey="date"
        />
        <div className="admRow">
          <label className="admField">
            <span className="admFieldLabel">Collection</span>
            <select className="admInput admSelect" value={values.collection} onChange={(event) => update({ collection: event.target.value as GalleryCollection })}>
              {GALLERY_COLLECTIONS.map((collection) => (
                <option key={collection} value={collection}>
                  {GALLERY_COLLECTION_LABELS[collection].en}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="admCheck">
          <input type="checkbox" checked={values.visible} onChange={(event) => update({ visible: event.target.checked })} />
          <span>Shown on the website.</span>
        </label>
      </section>

      <div className="admFormBar">
        <div className="admFormBarActions">
          <Link href="/admin/gallery" className="admBtn admBtnGhost">
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
