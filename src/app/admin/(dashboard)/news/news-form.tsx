"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import {
  MAX_GALLERY_IMAGES,
  collectFieldErrors,
  newsInputSchema,
  slugify,
  type FieldErrors,
  type NewsInput,
  type NewsStatus,
} from "@/lib/news-schema";
import type { NewsRecord } from "@/lib/news-store";
import { uploadDocumentFile, uploadImageFile } from "@/lib/upload-client";
import { saveNewsAction } from "./actions";

type Localized = { en: string; ar: string };
type Lang = keyof Localized;
type ImageValue = { src: string; width: number; height: number; alt: Localized };
type AttachmentKind = "none" | "file" | "link";

type FormValues = {
  slug: string;
  date: string;
  title: Localized;
  excerpt: Localized;
  image: ImageValue | null;
  gallery: ImageValue[];
  attachmentKind: AttachmentKind;
  attachmentHref: string;
  attachmentLabel: Localized;
};

const emptyText = (): Localized => ({ en: "", ar: "" });

function looksLikeUploadedFile(href: string): boolean {
  return href.startsWith("/documents/") || /\.pdf(\?.*)?$/i.test(href) || href.includes(".blob.vercel-storage.com/");
}

function initialValues(record: NewsRecord | null, defaultDate: string): FormValues {
  if (!record) {
    return {
      slug: "",
      date: defaultDate,
      title: emptyText(),
      excerpt: emptyText(),
      image: null,
      gallery: [],
      attachmentKind: "none",
      attachmentHref: "",
      attachmentLabel: emptyText(),
    };
  }
  const href = record.attachment?.href ?? "";
  return {
    slug: record.slug,
    date: record.date,
    title: { ...record.title },
    excerpt: { ...record.excerpt },
    image: record.image ? { ...record.image, alt: { ...record.image.alt } } : null,
    gallery: record.gallery.map((photo) => ({ ...photo, alt: { ...photo.alt } })),
    attachmentKind: record.attachment ? (looksLikeUploadedFile(href) ? "file" : "link") : "none",
    attachmentHref: href,
    attachmentLabel: record.attachment ? { ...record.attachment.label } : emptyText(),
  };
}

function toInput(values: FormValues, status: NewsStatus): NewsInput {
  return {
    slug: values.slug,
    date: values.date,
    status,
    title: values.title,
    excerpt: values.excerpt,
    image: values.image,
    gallery: values.gallery,
    attachment:
      values.attachmentKind === "none" ? null : { href: values.attachmentHref, label: values.attachmentLabel },
  };
}

function fileNameFromHref(href: string): string {
  try {
    const pathname = new URL(href, "https://example.invalid").pathname;
    return decodeURIComponent(pathname.split("/").pop() || href);
  } catch {
    return href;
  }
}

function FieldError({ message }: { message?: string }) {
  return message ? <em className="admFieldError">{message}</em> : null;
}

type BilingualProps = {
  label: string;
  hint?: string;
  value: Localized;
  onChange: (lang: Lang, text: string) => void;
  multiline?: boolean;
  errors: FieldErrors;
  errorKey: string;
};

function BilingualField({ label, hint, value, onChange, multiline, errors, errorKey }: BilingualProps) {
  const renderInput = (lang: Lang) => {
    const shared = {
      value: value[lang],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(lang, event.target.value),
      dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
      lang,
    };
    return multiline ? (
      <textarea className="admTextarea" rows={7} {...shared} />
    ) : (
      <input className="admInput" type="text" {...shared} />
    );
  };

  return (
    <div className="admField">
      <div className="admFieldLabel">
        <span>{label}</span>
        {hint ? <small className="admHint">{hint}</small> : null}
      </div>
      <div className="admBilingual">
        <label className="admLang">
          <span>English</span>
          {renderInput("en")}
          <FieldError message={errors[`${errorKey}.en`]} />
        </label>
        <label className="admLang">
          <span>العربية</span>
          {renderInput("ar")}
          <FieldError message={errors[`${errorKey}.ar`]} />
        </label>
      </div>
    </div>
  );
}

function AltFields({
  value,
  onChange,
}: {
  value: Localized;
  onChange: (lang: Lang, text: string) => void;
}) {
  return (
    <div className="admAltFields">
      <label className="admLang">
        <span>Photo description (English)</span>
        <input className="admInput" type="text" value={value.en} onChange={(e) => onChange("en", e.target.value)} />
      </label>
      <label className="admLang">
        <span>وصف الصورة (عربي)</span>
        <input
          className="admInput"
          type="text"
          dir="rtl"
          lang="ar"
          value={value.ar}
          onChange={(e) => onChange("ar", e.target.value)}
        />
      </label>
    </div>
  );
}

type NewsFormProps = {
  initial: NewsRecord | null;
  // Supplied by the server so the pre-filled date matches between server render and browser.
  defaultDate: string;
};

export default function NewsForm({ initial, defaultDate }: NewsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() => initialValues(initial, defaultDate));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"image" | "gallery" | "file" | null>(null);
  const [pending, startTransition] = useTransition();

  const isPublished = initial?.status === "published";
  const locked = pending || uploading !== null;

  const update = (patch: Partial<FormValues>) => setValues((current) => ({ ...current, ...patch }));

  const updateText = (key: "title" | "excerpt" | "attachmentLabel", lang: Lang, text: string) =>
    setValues((current) => ({ ...current, [key]: { ...current[key], [lang]: text } }));

  const updateTitle = (lang: Lang, text: string) =>
    setValues((current) => ({
      ...current,
      title: { ...current.title, [lang]: text },
      slug: lang === "en" && !slugTouched ? slugify(text) : current.slug,
    }));

  const submit = (status: NewsStatus) => {
    setFormError(null);
    const parsed = newsInputSchema.safeParse(toInput(values, status));
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error.issues));
      setFormError("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveNewsAction(initial?.id ?? null, parsed.data);
      if (!result.ok) {
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/admin/news");
      router.refresh();
    });
  };

  const reportUploadError = (error: unknown) =>
    setFormError(error instanceof Error ? error.message : "Upload failed. Please try again.");

  const pickMainImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setUploading("image");
    setFormError(null);
    try {
      const uploaded = await uploadImageFile(file);
      setValues((current) => ({ ...current, image: { ...uploaded, alt: current.image?.alt ?? emptyText() } }));
    } catch (error) {
      reportUploadError(error);
    } finally {
      setUploading(null);
    }
  };

  const pickGalleryImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) {
      return;
    }
    const room = MAX_GALLERY_IMAGES - values.gallery.length;
    if (room <= 0) {
      setFormError(`You can add at most ${MAX_GALLERY_IMAGES} extra photos.`);
      return;
    }
    setUploading("gallery");
    setFormError(null);
    try {
      for (const file of files.slice(0, room)) {
        const uploaded = await uploadImageFile(file);
        setValues((current) => ({ ...current, gallery: [...current.gallery, { ...uploaded, alt: emptyText() }] }));
      }
      if (files.length > room) {
        setFormError(`Only ${room} more photo${room === 1 ? "" : "s"} could be added (limit ${MAX_GALLERY_IMAGES}).`);
      }
    } catch (error) {
      reportUploadError(error);
    } finally {
      setUploading(null);
    }
  };

  const pickDocument = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setUploading("file");
    setFormError(null);
    try {
      const { href } = await uploadDocumentFile(file);
      update({ attachmentHref: href });
    } catch (error) {
      reportUploadError(error);
    } finally {
      setUploading(null);
    }
  };

  const updateGalleryAlt = (index: number, lang: Lang, text: string) =>
    setValues((current) => ({
      ...current,
      gallery: current.gallery.map((photo, i) =>
        i === index ? { ...photo, alt: { ...photo.alt, [lang]: text } } : photo,
      ),
    }));

  const removeGalleryImage = (index: number) =>
    setValues((current) => ({ ...current, gallery: current.gallery.filter((_, i) => i !== index) }));

  return (
    <form
      className="admForm admNewsForm"
      onSubmit={(event) => {
        event.preventDefault();
        submit(isPublished ? "published" : "draft");
      }}
    >
      {formError ? (
        <p className="admAlert admAlertError" role="alert">
          {formError}
        </p>
      ) : null}

      <section className="admCard">
        <h2 className="admCardTitle">Content</h2>

        <BilingualField
          label="Title"
          value={values.title}
          onChange={updateTitle}
          errors={errors}
          errorKey="title"
        />

        <BilingualField
          label="Text"
          hint="The paragraph shown under the title on the website."
          value={values.excerpt}
          onChange={(lang, text) => updateText("excerpt", lang, text)}
          multiline
          errors={errors}
          errorKey="excerpt"
        />

        <div className="admRow">
          <label className="admField">
            <span className="admFieldLabel">Date</span>
            <input
              className="admInput"
              type="date"
              value={values.date}
              onChange={(event) => update({ date: event.target.value })}
              required
            />
            <FieldError message={errors.date} />
          </label>
          <label className="admField admFieldGrow">
            <span className="admFieldLabel">Slug</span>
            <input
              className="admInput admMono"
              type="text"
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update({ slug: event.target.value });
              }}
              onBlur={(event) => update({ slug: slugify(event.target.value) })}
              spellCheck={false}
            />
            <small className="admHint">
              Short web address for this item. Created from the English title; lowercase letters, numbers and hyphens
              only.
            </small>
            <FieldError message={errors.slug} />
          </label>
        </div>
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">Main photo</h2>
        {values.image ? (
          <div className="admMediaItem">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="admThumb admThumbLarge" src={values.image.src} alt="" />
            <div className="admMediaBody">
              <AltFields
                value={values.image.alt}
                onChange={(lang, text) =>
                  setValues((current) =>
                    current.image
                      ? { ...current, image: { ...current.image, alt: { ...current.image.alt, [lang]: text } } }
                      : current,
                  )
                }
              />
              <div className="admMediaActions">
                <label className={`admBtn admBtnSmall${locked ? " isDisabled" : ""}`}>
                  {uploading === "image" ? "Uploading…" : "Replace photo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickMainImage} disabled={locked} />
                </label>
                <button
                  type="button"
                  className="admBtn admBtnSmall admBtnDanger"
                  onClick={() => update({ image: null })}
                  disabled={locked}
                >
                  Remove
                </button>
                <small className="admMuted">
                  {values.image.width} × {values.image.height} px
                </small>
              </div>
            </div>
          </div>
        ) : (
          <label className={`admUploadBox${locked ? " isDisabled" : ""}`}>
            <strong>{uploading === "image" ? "Uploading…" : "Choose a photo"}</strong>
            <span>JPG, PNG or WEBP. Large photos are resized automatically.</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickMainImage} disabled={locked} />
          </label>
        )}
        <FieldError message={errors.image} />
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">More photos</h2>
        <p className="admMuted">Shown as a small gallery under the main photo. Up to {MAX_GALLERY_IMAGES}.</p>
        {values.gallery.length > 0 ? (
          <div className="admGalleryList">
            {values.gallery.map((photo, index) => (
              <div className="admMediaItem" key={`${photo.src}-${index}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="admThumb" src={photo.src} alt="" />
                <div className="admMediaBody">
                  <AltFields value={photo.alt} onChange={(lang, text) => updateGalleryAlt(index, lang, text)} />
                  <div className="admMediaActions">
                    <button
                      type="button"
                      className="admBtn admBtnSmall admBtnDanger"
                      onClick={() => removeGalleryImage(index)}
                      disabled={locked}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {values.gallery.length < MAX_GALLERY_IMAGES ? (
          <label className={`admUploadBox admUploadBoxCompact${locked ? " isDisabled" : ""}`}>
            <strong>{uploading === "gallery" ? "Uploading…" : "Add photos"}</strong>
            <span>You can select several at once.</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={pickGalleryImages}
              disabled={locked}
            />
          </label>
        ) : null}
        <FieldError message={errors.gallery} />
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">Attachment</h2>
        <p className="admMuted">Optional link shown under the item, for example a PDF announcement or a Facebook post.</p>
        <div className="admRadioRow" role="radiogroup" aria-label="Attachment type">
          {(
            [
              ["none", "No attachment"],
              ["file", "Upload a PDF"],
              ["link", "External link"],
            ] as const
          ).map(([kind, label]) => (
            <label className="admRadio" key={kind}>
              <input
                type="radio"
                name="attachmentKind"
                value={kind}
                checked={values.attachmentKind === kind}
                onChange={() => update({ attachmentKind: kind, attachmentHref: kind === "none" ? "" : values.attachmentHref })}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {values.attachmentKind === "file" ? (
          <div className="admField">
            {values.attachmentHref ? (
              <p className="admFileName">
                Current file:{" "}
                <a href={values.attachmentHref} target="_blank" rel="noreferrer">
                  {fileNameFromHref(values.attachmentHref)}
                </a>
              </p>
            ) : null}
            <label className={`admBtn admBtnSmall${locked ? " isDisabled" : ""}`}>
              {uploading === "file" ? "Uploading…" : values.attachmentHref ? "Replace PDF" : "Choose PDF"}
              <input type="file" accept="application/pdf,.pdf" hidden onChange={pickDocument} disabled={locked} />
            </label>
            <FieldError message={errors["attachment.href"]} />
          </div>
        ) : null}

        {values.attachmentKind === "link" ? (
          <label className="admField">
            <span className="admFieldLabel">Link address</span>
            <input
              className="admInput admMono"
              type="url"
              placeholder="https://"
              value={values.attachmentHref}
              onChange={(event) => update({ attachmentHref: event.target.value })}
              dir="ltr"
            />
            <FieldError message={errors["attachment.href"]} />
          </label>
        ) : null}

        {values.attachmentKind !== "none" ? (
          <BilingualField
            label="Link text"
            hint='For example "Read the full announcement (PDF)".'
            value={values.attachmentLabel}
            onChange={(lang, text) => updateText("attachmentLabel", lang, text)}
            errors={errors}
            errorKey="attachment.label"
          />
        ) : null}
      </section>

      <div className="admFormBar">
        <Link href="/admin/news" className="admBtn admBtnGhost">
          Cancel
        </Link>
        <div className="admFormBarActions">
          {isPublished ? (
            <>
              <button type="button" className="admBtn" onClick={() => submit("draft")} disabled={locked}>
                Unpublish and save as draft
              </button>
              <button type="button" className="admBtn admBtnPrimary" onClick={() => submit("published")} disabled={locked}>
                {pending ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="admBtn" onClick={() => submit("draft")} disabled={locked}>
                {pending ? "Saving…" : "Save as draft"}
              </button>
              <button type="button" className="admBtn admBtnPrimary" onClick={() => submit("published")} disabled={locked}>
                {pending ? "Saving…" : "Publish to website"}
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
