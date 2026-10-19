"use client";

import { useState, useTransition } from "react";
import { BilingualField, FieldError, type FieldErrors } from "@/components/admin/fields";
import ImagePicker from "@/components/admin/image-picker";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes";
import { HERO_GROUPS, heroContentSchema, type HeroContent, type HeroGroup, type HeroSlide } from "@/lib/content/hero-schema";
import { collectFieldErrors } from "@/lib/news-schema";
import { saveHeroAction } from "./actions";

const GROUP_LABELS: Record<HeroGroup, string> = { pakistan: "Pakistan (left side)", lebanon: "Lebanon (right side)" };

export default function HeroForm({ initial, defaults }: { initial: HeroContent; defaults: HeroContent }) {
  const [content, setContent] = useState<HeroContent>(initial);
  const [snapshot, setSnapshot] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(content) !== snapshot;
  useUnsavedChangesWarning(dirty && !pending);

  const updateSlide = (group: HeroGroup, index: number, patch: Partial<HeroSlide>) =>
    setContent((current) => ({
      ...current,
      [group]: current[group].map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    }));

  const save = () => {
    setMessage(null);
    const parsed = heroContentSchema.safeParse(content);
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error.issues));
      setMessage({ kind: "error", text: "Please fix the highlighted fields. Every slide needs a picture." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveHeroAction(parsed.data);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setMessage({ kind: "error", text: result.error });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSnapshot(JSON.stringify(content));
      setMessage({ kind: "success", text: "Saved. The home page shows the new banners now." });
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      {message ? (
        <p className={`admAlert ${message.kind === "error" ? "admAlertError" : "admAlertSuccess"}`} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}

      {HERO_GROUPS.map((group) => (
        <section className="admCard" key={group}>
          <h2 className="admCardTitle">{GROUP_LABELS[group]}</h2>
          <p className="admMuted">Four pictures that fade one after another. Wide landscape photos, at least 1600 pixels across, look best.</p>
          <div className="admItemList">
            {content[group].map((slide, index) => (
              <div className="admItemBlock" key={index}>
                <div className="admItemBlockHead">
                  <strong>Slide {index + 1}</strong>
                </div>
                <ImagePicker
                  value={slide.image.src ? { ...slide.image, alt: { en: "", ar: "" } } : null}
                  onChange={(value) =>
                    updateSlide(group, index, { image: value ? { src: value.src, width: value.width, height: value.height } : { src: "", width: 0, height: 0 } })
                  }
                  onError={(text) => setMessage(text ? { kind: "error", text } : null)}
                  disabled={pending}
                  folder="banners"
                  withAlt={false}
                  maxEdge={2400}
                  emptyLabel="Choose a picture or drag it here"
                  hint="JPG, PNG or WEBP. Resized to 2400 pixels wide."
                  error={errors[`${group}.${index}.image.src`]}
                />
                <BilingualField
                  label="Caption"
                  value={slide.title}
                  singleLine
                  minRows={1}
                  onChange={(lang, text) => updateSlide(group, index, { title: { ...slide.title, [lang]: text } })}
                  errors={errors}
                  errorKey={`${group}.${index}.title`}
                />
                <BilingualField
                  label="Caption detail"
                  value={slide.subtitle}
                  singleLine
                  minRows={1}
                  onChange={(lang, text) => updateSlide(group, index, { subtitle: { ...slide.subtitle, [lang]: text } })}
                  errors={errors}
                  errorKey={`${group}.${index}.subtitle`}
                />
                <div className="admRow">
                  <label className="admField">
                    <span className="admFieldLabel">How the picture fills the box</span>
                    <select className="admInput admSelect" value={slide.fit} onChange={(event) => updateSlide(group, index, { fit: event.target.value as HeroSlide["fit"] })}>
                      <option value="cover">Fill the box (crop edges if needed)</option>
                      <option value="contain">Show the whole picture (dark bars if needed)</option>
                    </select>
                  </label>
                  <label className="admField admFieldGrow">
                    <span className="admFieldLabel">
                      <span>Focus point</span>
                      <small className="admHint">Usually just center. Use center 30% to favour the top of the picture, or center 70% for the bottom.</small>
                    </span>
                    <input className="admInput admMono" type="text" value={slide.position} onChange={(event) => updateSlide(group, index, { position: event.target.value })} />
                    <FieldError message={errors[`${group}.${index}.position`]} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="admFormBar">
        <div className="admFormBarActions">
          <button
            type="button"
            className="admBtn admBtnGhost"
            onClick={() => {
              if (window.confirm("Replace all slides with the original pictures and captions? Nothing is saved until you click Save.")) {
                setContent(defaults);
                setErrors({});
              }
            }}
            disabled={pending}
          >
            Restore original banners
          </button>
        </div>
        <div className="admFormBarActions">
          {dirty && !pending ? <span className="admUnsavedHint">Unsaved changes</span> : null}
          <button type="submit" className="admBtn admBtnPrimary" disabled={pending || !dirty}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
