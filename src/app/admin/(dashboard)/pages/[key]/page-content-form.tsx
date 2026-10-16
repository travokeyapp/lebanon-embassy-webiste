"use client";

import { useState, useTransition } from "react";
import { BilingualField, FieldError, ListControls, PlainField, emptyLocalized, moveItem, type FieldErrors } from "@/components/admin/fields";
import ImagePicker from "@/components/admin/image-picker";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes";
import { buildPageSchema, type CardItem, type LinkItem, type PageContent, type PageDef } from "@/lib/content/page-schema";
import { collectFieldErrors } from "@/lib/news-schema";
import { savePageContentAction } from "./actions";

type Props = { def: PageDef; initial: PageContent; defaults: PageContent };

const FIELD_ROWS = { text: 1, multiline: 3, lines: 4 } as const;

const newCard = (): CardItem => ({ title: emptyLocalized(), body: emptyLocalized(), items: emptyLocalized() });
const newLink = (): LinkItem => ({ label: emptyLocalized(), href: "" });

export default function PageContentForm({ def, initial, defaults }: Props) {
  const [content, setContent] = useState<PageContent>(initial);
  const [snapshot, setSnapshot] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(content) !== snapshot;
  useUnsavedChangesWarning(dirty && !pending);

  const setField = (name: string, lang: "en" | "ar", text: string) =>
    setContent((current) => ({
      ...current,
      fields: { ...current.fields, [name]: { ...(current.fields[name] ?? emptyLocalized()), [lang]: text } },
    }));

  const setPlain = (name: string, value: string) =>
    setContent((current) => ({ ...current, plain: { ...current.plain, [name]: value } }));

  const setCards = (name: string, cards: CardItem[]) =>
    setContent((current) => ({ ...current, cards: { ...current.cards, [name]: cards } }));

  const setLinks = (name: string, links: LinkItem[]) =>
    setContent((current) => ({ ...current, links: { ...current.links, [name]: links } }));

  const save = () => {
    setMessage(null);
    const parsed = buildPageSchema(def).safeParse(content);
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error.issues));
      setMessage({ kind: "error", text: "Please fix the highlighted fields." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await savePageContentAction(def.key, parsed.data);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setMessage({ kind: "error", text: result.error });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSnapshot(JSON.stringify(content));
      setMessage({ kind: "success", text: "Saved. The website shows the new text now." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const restoreDefaults = () => {
    if (window.confirm("Replace everything in this form with the original website text? Nothing is saved until you click Save.")) {
      setContent(defaults);
      setErrors({});
      setMessage(null);
    }
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

      {def.fields.length > 0 ? (
        <section className="admCard">
          <h2 className="admCardTitle">Text</h2>
          {def.fields.map((field) => (
            <BilingualField
              key={field.name}
              label={field.label}
              hint={field.hint}
              value={content.fields[field.name] ?? emptyLocalized()}
              onChange={(lang, text) => setField(field.name, lang, text)}
              minRows={FIELD_ROWS[field.kind]}
              singleLine={field.kind === "text"}
              errors={errors}
              errorKey={`fields.${field.name}`}
            />
          ))}
        </section>
      ) : null}

      {def.plain.length > 0 ? (
        <section className="admCard">
          <h2 className="admCardTitle">Details</h2>
          {def.plain.map((field) => (
            <PlainField
              key={field.name}
              label={field.label}
              hint={field.hint}
              value={content.plain[field.name] ?? ""}
              onChange={(value) => setPlain(field.name, value)}
              multiline={field.kind === "plainLines"}
              type={field.type ?? "text"}
              mono={field.type === "url"}
              error={errors[`plain.${field.name}`]}
            />
          ))}
        </section>
      ) : null}

      {def.images.map((image) => (
        <section className="admCard" key={image.name}>
          <h2 className="admCardTitle">{image.label}</h2>
          {image.hint ? <p className="admMuted">{image.hint}</p> : null}
          <ImagePicker
            value={content.images[image.name] ?? null}
            onChange={(value) => setContent((current) => ({ ...current, images: { ...current.images, [image.name]: value } }))}
            onError={(text) => setMessage(text ? { kind: "error", text } : null)}
            disabled={pending}
            folder="pages"
            error={errors[`images.${image.name}`]}
          />
        </section>
      ))}

      {def.cards.map((list) => {
        const cards = content.cards[list.name] ?? [];
        return (
          <section className="admCard" key={list.name}>
            <h2 className="admCardTitle">{list.label}</h2>
            {list.hint ? <p className="admMuted">{list.hint}</p> : null}
            <div className="admItemList">
              {cards.map((card, index) => (
                <div className="admItemBlock" key={index}>
                  <div className="admItemBlockHead">
                    <strong>
                      {list.itemLabel.charAt(0).toUpperCase() + list.itemLabel.slice(1)} {index + 1}
                    </strong>
                    <ListControls
                      index={index}
                      total={cards.length}
                      label={list.itemLabel}
                      disabled={pending}
                      onMove={(delta) => setCards(list.name, moveItem(cards, index, delta))}
                      onRemove={() => {
                        if (window.confirm(`Remove ${list.itemLabel} ${index + 1}?`)) {
                          setCards(list.name, cards.filter((_, i) => i !== index));
                        }
                      }}
                    />
                  </div>
                  <BilingualField
                    label="Title"
                    value={card.title}
                    singleLine
                    minRows={1}
                    onChange={(lang, text) =>
                      setCards(list.name, cards.map((c, i) => (i === index ? { ...c, title: { ...c.title, [lang]: text } } : c)))
                    }
                    errors={errors}
                    errorKey={`cards.${list.name}.${index}.title`}
                  />
                  {list.bodyLabel ? (
                    <BilingualField
                      label={list.bodyLabel}
                      value={card.body}
                      minRows={3}
                      onChange={(lang, text) =>
                        setCards(list.name, cards.map((c, i) => (i === index ? { ...c, body: { ...c.body, [lang]: text } } : c)))
                      }
                      errors={errors}
                      errorKey={`cards.${list.name}.${index}.body`}
                    />
                  ) : null}
                  {list.itemsLabel ? (
                    <BilingualField
                      label={list.itemsLabel}
                      value={card.items}
                      minRows={3}
                      onChange={(lang, text) =>
                        setCards(list.name, cards.map((c, i) => (i === index ? { ...c, items: { ...c.items, [lang]: text } } : c)))
                      }
                      errors={errors}
                      errorKey={`cards.${list.name}.${index}.items`}
                    />
                  ) : null}
                </div>
              ))}
            </div>
            <button type="button" className="admBtn" onClick={() => setCards(list.name, [...cards, newCard()])} disabled={pending}>
              + Add {list.itemLabel}
            </button>
            <FieldError message={errors[`cards.${list.name}`]} />
          </section>
        );
      })}

      {def.links.map((list) => {
        const links = content.links[list.name] ?? [];
        return (
          <section className="admCard" key={list.name}>
            <h2 className="admCardTitle">{list.label}</h2>
            {list.hint ? <p className="admMuted">{list.hint}</p> : null}
            <div className="admItemList">
              {links.map((link, index) => (
                <div className="admItemBlock" key={index}>
                  <div className="admItemBlockHead">
                    <strong>Link {index + 1}</strong>
                    <ListControls
                      index={index}
                      total={links.length}
                      label="link"
                      disabled={pending}
                      onMove={(delta) => setLinks(list.name, moveItem(links, index, delta))}
                      onRemove={() => setLinks(list.name, links.filter((_, i) => i !== index))}
                    />
                  </div>
                  <BilingualField
                    label="Link text"
                    value={link.label}
                    singleLine
                    minRows={1}
                    onChange={(lang, text) =>
                      setLinks(list.name, links.map((l, i) => (i === index ? { ...l, label: { ...l.label, [lang]: text } } : l)))
                    }
                    errors={errors}
                    errorKey={`links.${list.name}.${index}.label`}
                  />
                  <PlainField
                    label={list.hrefLabel}
                    hint={list.hrefHint}
                    value={link.href}
                    mono
                    onChange={(value) => setLinks(list.name, links.map((l, i) => (i === index ? { ...l, href: value } : l)))}
                    error={errors[`links.${list.name}.${index}.href`]}
                  />
                </div>
              ))}
            </div>
            <button type="button" className="admBtn" onClick={() => setLinks(list.name, [...links, newLink()])} disabled={pending}>
              + Add link
            </button>
          </section>
        );
      })}

      <div className="admFormBar">
        <div className="admFormBarActions">
          <button type="button" className="admBtn admBtnGhost" onClick={restoreDefaults} disabled={pending}>
            Restore original text
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
