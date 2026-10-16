"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import { BilingualField, FieldError, PlainField, emptyLocalized, type FieldErrors, type Localized } from "@/components/admin/fields";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  documentInputSchema,
  formatFileSize,
  type DocumentCategory,
  type DocumentRecord,
} from "@/lib/content/documents-schema";
import { collectFieldErrors } from "@/lib/news-schema";
import { uploadDocumentFile } from "@/lib/upload-client";
import { saveDocumentAction } from "./actions";

type Source = "file" | "link";

type FormValues = {
  title: Localized;
  description: Localized;
  category: DocumentCategory;
  source: Source;
  href: string;
  fileName: string;
  contentType: string;
  size: number;
  visible: boolean;
};

function initialValues(record: DocumentRecord | null): FormValues {
  return {
    title: record ? { ...record.title } : emptyLocalized(),
    description: record ? { ...record.description } : emptyLocalized(),
    category: record?.category ?? "visa-forms",
    source: record && !record.fileName && /^https?:\/\//i.test(record.href) ? "link" : "file",
    href: record?.href ?? "",
    fileName: record?.fileName ?? "",
    contentType: record?.contentType ?? "",
    size: record?.size ?? 0,
    visible: record?.visible ?? true,
  };
}

export default function DocumentForm({ initial }: { initial: DocumentRecord | null }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() => initialValues(initial));
  const [snapshot] = useState(() => JSON.stringify(initialValues(initial)));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();

  const locked = pending || uploading;
  const dirty = JSON.stringify(values) !== snapshot;
  useUnsavedChangesWarning(dirty && !pending);

  const update = (patch: Partial<FormValues>) => setValues((current) => ({ ...current, ...patch }));

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file || locked) {
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      const uploaded = await uploadDocumentFile(file, { folder: "documents", allowImages: true });
      setValues((current) => ({
        ...current,
        href: uploaded.href,
        fileName: uploaded.name,
        contentType: uploaded.contentType,
        size: uploaded.size,
        title: current.title.en ? current.title : { ...current.title, en: uploaded.name.replace(/\.[^.]+$/, "") },
      }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    setFormError(null);
    const input = {
      title: values.title,
      description: values.description,
      category: values.category,
      href: values.href,
      fileName: values.source === "file" ? values.fileName : "",
      contentType: values.source === "file" ? values.contentType : "",
      size: values.source === "file" ? values.size : 0,
      visible: values.visible,
    };
    const parsed = documentInputSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error.issues));
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveDocumentAction(initial?.id ?? null, parsed.data);
      if (!result.ok) {
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
        return;
      }
      router.push("/admin/documents?saved=1");
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
        <h2 className="admCardTitle">File</h2>
        <div className="admRadioRow" role="radiogroup" aria-label="Source">
          <label className="admRadio">
            <input type="radio" name="source" checked={values.source === "file"} onChange={() => update({ source: "file" })} />
            <span>Upload a file</span>
          </label>
          <label className="admRadio">
            <input type="radio" name="source" checked={values.source === "link"} onChange={() => update({ source: "link" })} />
            <span>Link to a file elsewhere</span>
          </label>
        </div>

        {values.source === "file" ? (
          <div className="admField">
            {values.href ? (
              <p className="admFileName">
                Current file:{" "}
                <a href={values.href} target="_blank" rel="noreferrer">
                  {values.fileName || values.href}
                </a>
                {values.size ? <span className="admMuted"> ({formatFileSize(values.size)})</span> : null}
              </p>
            ) : null}
            <label
              className={`admUploadBox admUploadBoxCompact${locked ? " isDisabled" : ""}${dragOver ? " isDragOver" : ""}`}
              onDragOver={(event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                if (!locked) {
                  setDragOver(true);
                }
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                setDragOver(false);
                void handleFiles(Array.from(event.dataTransfer.files));
              }}
            >
              <strong>{uploading ? "Uploading…" : values.href ? "Replace the file or drag it here" : "Choose a file or drag it here"}</strong>
              <span>PDF, JPG or PNG, up to 25 MB.</span>
              <input
                type="file"
                accept="application/pdf,.pdf,image/jpeg,image/png"
                hidden
                disabled={locked}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  void handleFiles(files);
                }}
              />
            </label>
            <FieldError message={errors.href} />
          </div>
        ) : (
          <PlainField
            label="File address"
            hint="A full https:// address of the file."
            value={values.href}
            onChange={(value) => update({ href: value })}
            type="url"
            mono
            error={errors.href}
          />
        )}
      </section>

      <section className="admCard">
        <h2 className="admCardTitle">Details</h2>
        <BilingualField
          label="Title"
          value={values.title}
          singleLine
          minRows={1}
          onChange={(lang, text) => update({ title: { ...values.title, [lang]: text } })}
          errors={errors}
          errorKey="title"
        />
        <BilingualField
          label="Short description (optional)"
          value={values.description}
          minRows={2}
          onChange={(lang, text) => update({ description: { ...values.description, [lang]: text } })}
          errors={errors}
          errorKey="description"
        />
        <div className="admRow">
          <label className="admField">
            <span className="admFieldLabel">Category</span>
            <select className="admInput admSelect" value={values.category} onChange={(event) => update({ category: event.target.value as DocumentCategory })}>
              {DOCUMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {DOCUMENT_CATEGORY_LABELS[category].en}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="admCheck">
          <input type="checkbox" checked={values.visible} onChange={(event) => update({ visible: event.target.checked })} />
          <span>Shown on the website. Visa forms also appear on the Visas page.</span>
        </label>
      </section>

      <div className="admFormBar">
        <div className="admFormBarActions">
          <Link href="/admin/documents" className="admBtn admBtnGhost">
            Cancel
          </Link>
        </div>
        <div className="admFormBarActions">
          {dirty && !pending ? <span className="admUnsavedHint">Unsaved changes</span> : null}
          <button type="submit" className="admBtn admBtnPrimary" disabled={locked}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
