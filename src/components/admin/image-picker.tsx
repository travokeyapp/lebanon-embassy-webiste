"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { uploadImageFile, type UploadedImage } from "@/lib/upload-client";
import { FieldError, type Localized } from "./fields";

export type ImageValue = UploadedImage & { alt: Localized };

type ImagePickerProps = {
  value: ImageValue | null;
  onChange: (value: ImageValue | null) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
  // Folder inside the upload store, e.g. "news" or "banners".
  folder: string;
  // When false the alt-text inputs are hidden (decorative images).
  withAlt?: boolean;
  emptyLabel?: string;
  hint?: string;
  error?: string;
  large?: boolean;
  // Longest edge after resizing; banners need more pixels than news photos.
  maxEdge?: number;
};

// One picture: upload (click or drag), preview, optional description, replace, remove.
export default function ImagePicker({
  value,
  onChange,
  onError,
  disabled = false,
  folder,
  withAlt = true,
  emptyLabel = "Choose a photo or drag it here",
  hint = "JPG, PNG or WEBP. Large photos are resized automatically.",
  error,
  large = true,
  maxEdge,
}: ImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const locked = disabled || uploading;

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file || locked) {
      return;
    }
    setUploading(true);
    onError(null);
    try {
      const uploaded = await uploadImageFile(file, { folder, maxEdge });
      onChange({ ...uploaded, alt: value?.alt ?? { en: "", ar: "" } });
    } catch (uploadError) {
      onError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fromInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void handleFiles(files);
  };

  const dropProps = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!locked) {
        setDragOver(true);
      }
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragOver(false);
      void handleFiles(Array.from(event.dataTransfer.files));
    },
  };

  const setAlt = (lang: "en" | "ar", text: string) => {
    if (value) {
      onChange({ ...value, alt: { ...value.alt, [lang]: text } });
    }
  };

  if (!value) {
    return (
      <div>
        <label
          className={`admUploadBox${large ? "" : " admUploadBoxCompact"}${locked ? " isDisabled" : ""}${dragOver ? " isDragOver" : ""}`}
          {...dropProps}
        >
          <strong>{uploading ? "Uploading…" : emptyLabel}</strong>
          <span>{hint}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={fromInput} disabled={locked} />
        </label>
        <FieldError message={error} />
      </div>
    );
  }

  return (
    <div className="admMediaItem" {...dropProps}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`admThumb${large ? " admThumbLarge" : ""}`} src={value.src} alt="" />
      <div className="admMediaBody">
        {withAlt ? (
          <div className="admAltFields">
            <label className="admLang">
              <span>Photo description (English)</span>
              <input className="admInput" type="text" value={value.alt.en} onChange={(e) => setAlt("en", e.target.value)} />
            </label>
            <label className="admLang">
              <span>وصف الصورة (عربي)</span>
              <input
                className="admInput"
                type="text"
                dir="rtl"
                lang="ar"
                value={value.alt.ar}
                onChange={(e) => setAlt("ar", e.target.value)}
              />
            </label>
          </div>
        ) : null}
        <div className="admMediaActions">
          <label className={`admBtn admBtnSmall${locked ? " isDisabled" : ""}`}>
            {uploading ? "Uploading…" : "Replace photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={fromInput} disabled={locked} />
          </label>
          <button type="button" className="admBtn admBtnSmall admBtnDanger" onClick={() => onChange(null)} disabled={locked}>
            Remove
          </button>
          <small className="admMuted">
            {value.width} × {value.height} px
          </small>
        </div>
        <FieldError message={error} />
      </div>
    </div>
  );
}
