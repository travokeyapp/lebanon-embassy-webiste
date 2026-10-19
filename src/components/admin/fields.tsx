"use client";

import { useEffect, useRef, type ChangeEvent, type TextareaHTMLAttributes } from "react";

// Shared building blocks for the admin forms.

export type Localized = { en: string; ar: string };
export type Lang = keyof Localized;
export type FieldErrors = Record<string, string>;

export const emptyLocalized = (): Localized => ({ en: "", ar: "" });

export function FieldError({ message }: { message?: string }) {
  return message ? <em className="admFieldError">{message}</em> : null;
}

type AutoGrowProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number };

// A textarea that grows with its content instead of scrolling.
export function AutoGrowTextarea({ minRows = 2, className = "", value, ...rest }: AutoGrowProps) {
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
  minRows?: number;
  errors?: FieldErrors;
  errorKey?: string;
  // Collapse line breaks (for titles and other single-line values).
  singleLine?: boolean;
};

export function BilingualField({
  label,
  hint,
  value,
  onChange,
  minRows = 2,
  errors = {},
  errorKey = "",
  singleLine = false,
}: BilingualProps) {
  const handle = (lang: Lang) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = singleLine ? event.target.value.replace(/\s*[\r\n]+\s*/g, " ") : event.target.value;
    onChange(lang, text);
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
          <AutoGrowTextarea minRows={minRows} value={value.en} onChange={handle("en")} dir="ltr" lang="en" />
          <FieldError message={errors[`${errorKey}.en`]} />
        </label>
        <label className="admLang">
          <span>العربية</span>
          <AutoGrowTextarea minRows={minRows} value={value.ar} onChange={handle("ar")} dir="rtl" lang="ar" />
          <FieldError message={errors[`${errorKey}.ar`]} />
        </label>
      </div>
    </div>
  );
}

type PlainFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (text: string) => void;
  multiline?: boolean;
  minRows?: number;
  type?: string;
  placeholder?: string;
  error?: string;
  mono?: boolean;
};

// A value that is the same in both languages (an email address, a phone number, a web address).
export function PlainField({
  label,
  hint,
  value,
  onChange,
  multiline = false,
  minRows = 3,
  type = "text",
  placeholder,
  error,
  mono = false,
}: PlainFieldProps) {
  return (
    <label className="admField">
      <span className="admFieldLabel">
        <span>{label}</span>
        {hint ? <small className="admHint">{hint}</small> : null}
      </span>
      {multiline ? (
        <AutoGrowTextarea
          minRows={minRows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          dir="ltr"
          className={mono ? "admMono" : ""}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={`admInput${mono ? " admMono" : ""}`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          dir="ltr"
          placeholder={placeholder}
        />
      )}
      <FieldError message={error} />
    </label>
  );
}

export function ListControls({
  index,
  total,
  onMove,
  onRemove,
  disabled,
  label,
}: {
  index: number;
  total: number;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="admMediaActions">
      <button type="button" className="admBtn admBtnSmall" onClick={() => onMove(-1)} disabled={disabled || index === 0} aria-label={`Move ${label} ${index + 1} up`}>
        Move up
      </button>
      <button
        type="button"
        className="admBtn admBtnSmall"
        onClick={() => onMove(1)}
        disabled={disabled || index === total - 1}
        aria-label={`Move ${label} ${index + 1} down`}
      >
        Move down
      </button>
      <button type="button" className="admBtn admBtnSmall admBtnDanger" onClick={onRemove} disabled={disabled}>
        Remove
      </button>
      <small className="admMuted">
        {index + 1} of {total}
      </small>
    </div>
  );
}

export function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) {
    return list;
  }
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
