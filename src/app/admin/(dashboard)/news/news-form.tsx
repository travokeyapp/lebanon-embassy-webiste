"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type TextareaHTMLAttributes,
} from "react";
import NewsCard from "@/components/news-card";
import type { Locale } from "@/lib/locale";
import { toNewsItem } from "@/lib/news-item";
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
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes";

type Localized = { en: string; ar: string };
type Lang = keyof Localized;
type ImageValue = { src: string; width: number; height: number; alt: Localized };
type AttachmentKind = "none" | "file" | "link";
type UploadTarget = "image" | "gallery" | "file";

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

const PREVIEW_PLACEHOLDERS: Record<Locale, { title: string; excerpt: string }> = {
  en: { title: "News title", excerpt: "The news text will appear here." },
  ar: { title: "عنوان الخبر", excerpt: "يظهر نص الخبر هنا." },
};

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

type AutoGrowProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number };

// A textarea that grows with its content instead of scrolling.
function AutoGrowTextarea({ minRows = 2, className = "", value, ...rest }: AutoGrowProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} rows={minRows} className={`admTextarea admTextareaAuto ${className}`} value={value} {...rest} />;
}

type BilingualProps = {
  label: string;
  hint?: string;
  value: Localized;
  onChange: (lang: Lang, text: string) => void;
  minRows: number;
  errors: FieldErrors;
  errorKey: string;
};

function BilingualField({ label, hint, value, onChange, minRows, errors, errorKey }: BilingualProps) {
  const renderInput = (lang: Lang) => (
    <AutoGrowTextarea
      minRows={minRows}
      value={value[lang]}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(lang, event.target.value)}
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
    />
  );

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

function AltFields({ value, onChange }: { value: Localized; onChange: (lang: Lang, text: string) => void }) {
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
  const [savedSnapshot] = useState(() => JSON.stringify(initialValues(initial, defaultDate)));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [dragOver, setDragOver] = useState<UploadTarget | null>(null);
  const [previewLang, setPreviewLang] = useState<Locale>("en");
  const [pending, startTransition] = useTransition();
  const previewRef = useRef<HTMLElement>(null);

  const isPublished = initial?.status === "published";
  const locked = pending || uploading !== null;
  const dirty = JSON.stringify(values) !== savedSnapshot;
  useUnsavedChangesWarning(dirty && !pending);

  const update = (patch: Partial<FormValues>) => setValues((current) => ({ ...current, ...patch }));

  const updateText = (key: "excerpt" | "attachmentLabel", lang: Lang, text: string) =>
    setValues((current) => ({ ...current, [key]: { ...current[key], [lang]: text } }));

  const updateTitle = (lang: Lang, rawText: string) => {
    const text = rawText.replace(/\s*[\r\n]+\s*/g, " ");
    setValues((current) => ({
      ...current,
      title: { ...current.title, [lang]: text },
      slug: lang === "en" && !slugTouched ? slugify(text) : current.slug,
    }));
  };

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
      router.push(`/admin/news?saved=${result.status}&slug=${encodeURIComponent(parsed.data.slug)}`);
      router.refresh();
    });
  };

  const reportUploadError = (error: unknown) =>
    setFormError(error instanceof Error ? error.message : "Upload failed. Please try again.");

  const handleMainImageFiles = async (files: File[]) => {
    const file = files[0];
    if (!file || locked) {
      return;
    }
    setUploading("image");
    setFormError(null);
    try {
      const uploaded = await uploadImageFile(file, { folder: "news" });
      setValues((current) => ({ ...current, image: { ...uploaded, alt: current.image?.alt ?? emptyText() } }));
    } catch (error) {
      reportUploadError(error);
    } finally {
      setUploading(null);
    }
  };

  const handleGalleryFiles = async (files: File[]) => {
    if (files.length === 0 || locked) {
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
        const uploaded = await uploadImageFile(file, { folder: "news" });
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

  const handleDocumentFiles = async (files: File[]) => {
    const file = files[0];
    if (!file || locked) {
      return;
    }
    setUploading("file");
    setFormError(null);
    try {
      const { href } = await uploadDocumentFile(file, { folder: "news" });
      update({ attachmentHref: href });
    } catch (error) {
      reportUploadError(error);
    } finally {
      setUploading(null);
    }
  };

  const fromInput = (handler: (files: File[]) => Promise<void>) => (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void handler(files);
  };

  // Drag-and-drop onto the upload boxes.
  const dropZone = (target: UploadTarget, handler: (files: File[]) => Promise<void>) => ({
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!locked) {
        setDragOver(target);
      }
    },
    onDragLeave: () => setDragOver((current) => (current === target ? null : current)),
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragOver(null);
      void handler(Array.from(event.dataTransfer.files));
    },
  });

  const updateGalleryAlt = (index: number, lang: Lang, text: string) =>
    setValues((current) => ({
      ...current,
      gallery: current.gallery.map((photo, i) =>
        i === index ? { ...photo, alt: { ...photo.alt, [lang]: text } } : photo,
      ),
    }));

  const removeGalleryImage = (index: number) =>
    setValues((current) => ({ ...current, gallery: current.gallery.filter((_, i) => i !== index) }));

  const moveGalleryImage = (index: number, delta: -1 | 1) =>
    setValues((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.gallery.length) {
        return current;
      }
      const gallery = [...current.gallery];
      [gallery[index], gallery[target]] = [gallery[target], gallery[index]];
      return { ...current, gallery };
    });

  const previewItem = toNewsItem(toInput(values, "draft"), previewLang);
  const previewDisplay = {
    ...previewItem,
    title: previewItem.title || PREVIEW_PLACEHOLDERS[previewLang].title,
    excerpt: previewItem.excerpt || PREVIEW_PLACEHOLDERS[previewLang].excerpt,
  };

  const boxClass = (base: string, target: UploadTarget) =>
    `${base}${locked ? " isDisabled" : ""}${dragOver === target ? " isDragOver" : ""}`;

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
          minRows={2}
          errors={errors}
          errorKey="title"
        />

        <BilingualField
          label="Text"
          hint="The paragraph shown under the title on the website."
          value={values.excerpt}
          onChange={(lang, text) => updateText("excerpt", lang, text)}
          minRows={6}
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
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={fromInput(handleMainImageFiles)}
                    disabled={locked}
                  />
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
          <label className={boxClass("admUploadBox", "image")} {...dropZone("image", handleMainImageFiles)}>
            <strong>{uploading === "image" ? "Uploading…" : "Choose a photo or drag it here"}</strong>
            <span>JPG, PNG or WEBP. Large photos are resized automatically.</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={fromInput(handleMainImageFiles)}
              disabled={locked}
            />
          </label>
        )}
        <FieldError message={errors.image} />
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">More photos</h2>
        <p className="admMuted">Shown as a small gallery under the main photo, in this order. Up to {MAX_GALLERY_IMAGES}.</p>
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
                      className="admBtn admBtnSmall"
                      onClick={() => moveGalleryImage(index, -1)}
                      disabled={locked || index === 0}
                      aria-label={`Move photo ${index + 1} up`}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      className="admBtn admBtnSmall"
                      onClick={() => moveGalleryImage(index, 1)}
                      disabled={locked || index === values.gallery.length - 1}
                      aria-label={`Move photo ${index + 1} down`}
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      className="admBtn admBtnSmall admBtnDanger"
                      onClick={() => removeGalleryImage(index)}
                      disabled={locked}
                    >
                      Remove
                    </button>
                    <small className="admMuted">
                      {index + 1} of {values.gallery.length}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {values.gallery.length < MAX_GALLERY_IMAGES ? (
          <label
            className={boxClass("admUploadBox admUploadBoxCompact", "gallery")}
            {...dropZone("gallery", handleGalleryFiles)}
          >
            <strong>{uploading === "gallery" ? "Uploading…" : "Add photos or drag them here"}</strong>
            <span>You can select several at once.</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={fromInput(handleGalleryFiles)}
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
                onChange={() =>
                  update({ attachmentKind: kind, attachmentHref: kind === "none" ? "" : values.attachmentHref })
                }
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
            <label
              className={boxClass("admUploadBox admUploadBoxCompact", "file")}
              {...dropZone("file", handleDocumentFiles)}
            >
              <strong>
                {uploading === "file"
                  ? "Uploading…"
                  : values.attachmentHref
                    ? "Replace PDF or drag it here"
                    : "Choose a PDF or drag it here"}
              </strong>
              <span>PDF files up to 25 MB.</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                hidden
                onChange={fromInput(handleDocumentFiles)}
                disabled={locked}
              />
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
            minRows={1}
            errors={errors}
            errorKey="attachment.label"
          />
        ) : null}
      </section>

      <section className="admCard admPreviewCard" ref={previewRef} id="preview" aria-label="Preview">
        <div className="admPreviewHead">
          <div>
            <h2 className="admCardTitle">Preview</h2>
            <p className="admMuted">How this item will look on the website. Updates as you type.</p>
          </div>
          <div className="admTabs" role="tablist" aria-label="Preview language">
            {(["en", "ar"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={previewLang === lang}
                className="admTab"
                onClick={() => setPreviewLang(lang)}
              >
                {lang === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`admPreviewFrame${previewLang === "ar" ? " rtl" : ""}`}
          dir={previewLang === "ar" ? "rtl" : "ltr"}
          lang={previewLang}
        >
          <div className="newsList">
            <NewsCard item={previewDisplay} showGallery />
          </div>
        </div>
      </section>

      <div className="admFormBar">
        <div className="admFormBarActions">
          <Link href="/admin/news" className="admBtn admBtnGhost">
            Cancel
          </Link>
          <button
            type="button"
            className="admBtn admBtnGhost"
            onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            Preview
          </button>
        </div>
        <div className="admFormBarActions">
          {dirty && !pending ? <span className="admUnsavedHint">Unsaved changes</span> : null}
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
