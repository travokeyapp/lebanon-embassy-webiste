import { z } from "zod";
import type { Locale } from "@/lib/locale";
import { newsImageSchema } from "@/lib/news-schema";

// A small, generic content model for the mostly-static pages: bilingual text
// fields, plain (same in both languages) values, lists of cards, lists of
// links and pictures. Each page declares which of these it uses in PAGE_DEFS
// and the admin renders a form from that declaration.

export type LocalizedText = { en: string; ar: string };
export type CardItem = { title: LocalizedText; body: LocalizedText; items: LocalizedText };
export type LinkItem = { label: LocalizedText; href: string };
export type ImageItem = { src: string; width: number; height: number; alt: LocalizedText };

export type PageContent = {
  fields: Record<string, LocalizedText>;
  plain: Record<string, string>;
  cards: Record<string, CardItem[]>;
  links: Record<string, LinkItem[]>;
  images: Record<string, ImageItem | null>;
};

export type FieldDef = {
  name: string;
  label: string;
  kind: "text" | "multiline" | "lines";
  hint?: string;
};
export type PlainDef = {
  name: string;
  label: string;
  kind: "plain" | "plainLines";
  hint?: string;
  type?: "text" | "email" | "url";
};
export type CardListDef = {
  name: string;
  label: string;
  itemLabel: string;
  hint?: string;
  // Labels for the optional parts; a part is hidden when its label is absent.
  bodyLabel?: string;
  itemsLabel?: string;
};
export type LinkListDef = {
  name: string;
  label: string;
  hint?: string;
  hrefLabel: string;
  hrefHint?: string;
};
export type ImageDef = { name: string; label: string; hint?: string };

export type PageDef = {
  key: PageKey;
  label: string;
  description: string;
  publicPath: string;
  fields: FieldDef[];
  plain: PlainDef[];
  cards: CardListDef[];
  links: LinkListDef[];
  images: ImageDef[];
};

export const PAGE_KEYS = ["services", "consular", "visas", "ambassador", "relations", "about", "settings"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value);
}

const ONE_PER_LINE = "One per line.";

export const PAGE_DEFS: Record<PageKey, PageDef> = {
  services: {
    key: "services",
    label: "Services page",
    description: "The Embassy Services overview page.",
    publicPath: "/services",
    fields: [
      { name: "title", label: "Page title", kind: "text" },
      { name: "lead", label: "Introduction", kind: "multiline" },
      { name: "note", label: "Note shown at the bottom", kind: "multiline" },
    ],
    plain: [],
    cards: [{ name: "cards", label: "Service cards", itemLabel: "card", itemsLabel: `Points. ${ONE_PER_LINE}` }],
    links: [],
    images: [],
  },
  consular: {
    key: "consular",
    label: "Consular Affairs page",
    description: "Consular service cards, the application workflow and the notice.",
    publicPath: "/consular",
    fields: [
      { name: "title", label: "Page title", kind: "text" },
      { name: "lead", label: "Introduction", kind: "multiline" },
      { name: "workflowTitle", label: "Workflow heading", kind: "text" },
      { name: "workflowLead", label: "Workflow introduction", kind: "multiline" },
      { name: "workflowSteps", label: "Workflow steps", kind: "lines", hint: ONE_PER_LINE },
      { name: "notice", label: "Important notice", kind: "multiline" },
    ],
    plain: [],
    cards: [{ name: "cards", label: "Service cards", itemLabel: "card", itemsLabel: `Points. ${ONE_PER_LINE}` }],
    links: [],
    images: [],
  },
  visas: {
    key: "visas",
    label: "Visas page",
    description: "Visa categories, requirements, fees, process and notes. Forms are managed under Documents & forms. The recommended-agency card is fixed.",
    publicPath: "/visas",
    fields: [
      { name: "title", label: "Page title", kind: "text" },
      { name: "lead", label: "Introduction", kind: "multiline" },
      { name: "categoriesTitle", label: "Heading: visa categories", kind: "text" },
      { name: "requiredTitle", label: "Heading: core required documents", kind: "text" },
      { name: "required", label: "Core required documents", kind: "lines", hint: ONE_PER_LINE },
      { name: "specialCasesTitle", label: "Heading: special cases", kind: "text" },
      { name: "specialCases", label: "Special cases", kind: "lines", hint: ONE_PER_LINE },
      { name: "visaSpecificTitle", label: "Heading: additional documents by visa type", kind: "text" },
      { name: "feeTitle", label: "Heading: fees", kind: "text" },
      { name: "fees", label: "Fees", kind: "lines", hint: ONE_PER_LINE },
      { name: "processTitle", label: "Heading: application process", kind: "text" },
      { name: "process", label: "Application process steps", kind: "lines", hint: ONE_PER_LINE },
      { name: "notesTitle", label: "Heading: important notes", kind: "text" },
      { name: "notes", label: "Important notes", kind: "lines", hint: ONE_PER_LINE },
      { name: "downloadTitle", label: "Heading: forms download", kind: "text" },
      { name: "downloadHint", label: "Forms download text", kind: "multiline" },
      // The "Need assistance" card naming the Embassy's recommended agency is
      // deliberately not editable; it lives in the page code.
    ],
    plain: [],
    cards: [
      { name: "categories", label: "Visa categories", itemLabel: "category", bodyLabel: "Description" },
      { name: "visaSpecific", label: "Additional documents by visa type", itemLabel: "visa type", itemsLabel: `Documents. ${ONE_PER_LINE}` },
    ],
    links: [],
    images: [],
  },
  ambassador: {
    key: "ambassador",
    label: "The Ambassador page",
    description: "Profile, portrait and message. The name, role and home-page portrait are also used on the home page.",
    publicPath: "/ambassador",
    fields: [
      { name: "title", label: "Page title", kind: "text" },
      { name: "subtitle", label: "Subtitle", kind: "multiline" },
      { name: "name", label: "Name", kind: "text" },
      { name: "role", label: "Role", kind: "text" },
      { name: "profileTitle", label: "Heading: bio data", kind: "text" },
      { name: "profile", label: "Bio data lines", kind: "lines", hint: ONE_PER_LINE },
      { name: "messageTitle", label: "Heading: message", kind: "text" },
      { name: "message", label: "Message", kind: "lines", hint: "One paragraph per line." },
      { name: "signatureLead", label: "Signature lead (e.g. Sincerely,)", kind: "text" },
      { name: "signatureName", label: "Signature name", kind: "text" },
    ],
    plain: [],
    cards: [],
    links: [],
    images: [
      { name: "portrait", label: "Portrait on the Ambassador page", hint: "Portrait orientation works best." },
      { name: "homePortrait", label: "Portrait in the Head of Mission card on the home page" },
    ],
  },
  relations: {
    key: "relations",
    label: "Lebanon-Pakistan Relations page",
    description: "Introduction, sections, head of mission card and quick links.",
    publicPath: "/relations",
    fields: [
      { name: "title", label: "Page title", kind: "text" },
      { name: "intro", label: "Introduction", kind: "multiline" },
      { name: "headOfMissionTitle", label: "Heading: head of mission", kind: "text" },
      { name: "headName", label: "Head of mission name", kind: "text" },
      { name: "headRole", label: "Head of mission role", kind: "text" },
      { name: "viewBiography", label: "Biography button text", kind: "text" },
      { name: "quickLinksTitle", label: "Heading: quick links", kind: "text" },
      { name: "footnote", label: "Footnote", kind: "multiline" },
    ],
    plain: [],
    cards: [
      {
        name: "sections",
        label: "Sections",
        itemLabel: "section",
        bodyLabel: "Paragraphs. One paragraph per line.",
        itemsLabel: `Bullet points. ${ONE_PER_LINE}`,
      },
    ],
    links: [{ name: "quickLinks", label: "Quick links", hrefLabel: "Page", hrefHint: "A path on this site such as /visas or /contact." }],
    images: [],
  },
  about: {
    key: "about",
    label: "About the Embassy page",
    description: "Mission, milestones and consular focus.",
    publicPath: "/about",
    fields: [
      { name: "title", label: "Page title", kind: "text" },
      { name: "lead", label: "Introduction", kind: "multiline" },
      { name: "missionTitle", label: "Heading: mission", kind: "text" },
      { name: "mission", label: "Mission points", kind: "lines", hint: ONE_PER_LINE },
      { name: "milestonesTitle", label: "Heading: milestones", kind: "text" },
      { name: "milestones", label: "Milestones", kind: "lines", hint: ONE_PER_LINE },
      { name: "servicesTitle", label: "Heading: consular focus", kind: "text" },
      { name: "services", label: "Consular focus points", kind: "lines", hint: ONE_PER_LINE },
      { name: "note", label: "Note", kind: "multiline" },
    ],
    plain: [],
    cards: [],
    links: [],
    images: [],
  },
  settings: {
    key: "settings",
    label: "Contact details & footer",
    description: "Address, phones, office hours, the top ribbon and the footer, shown on every page.",
    publicPath: "/contact",
    fields: [
      { name: "ribbon", label: "Top ribbon text", kind: "text" },
      { name: "address", label: "Address", kind: "text" },
      { name: "officeHours", label: "Office hours", kind: "lines", hint: ONE_PER_LINE },
      { name: "footerAbout", label: "Footer: about text", kind: "multiline" },
      { name: "copyright", label: "Footer: copyright line", kind: "text" },
    ],
    plain: [
      { name: "phones", label: "Phone numbers (contact page)", kind: "plainLines", hint: ONE_PER_LINE },
      { name: "footerPhone", label: "Phone shown in the footer", kind: "plain" },
      { name: "fax", label: "Fax", kind: "plain" },
      { name: "email", label: "Email address", kind: "plain", type: "email" },
      {
        name: "mapEmbedUrl",
        label: "Map embed address",
        kind: "plain",
        type: "url",
        hint: "Google Maps → Share → Embed a map → copy only the address inside src=\"…\".",
      },
    ],
    cards: [],
    links: [{ name: "footerLinks", label: "Footer: related links", hrefLabel: "Web address", hrefHint: "Full address starting with https://" }],
    images: [],
  },
};

// ---- validation -----------------------------------------------------------

function isAllowedHref(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value) || (value.startsWith("/") && !value.startsWith("//")) || /^(mailto|tel):/i.test(value);
}

const localized = (max: number) =>
  z.object({ en: z.string().trim().max(max, `Must be ${max} characters or fewer.`), ar: z.string().trim().max(max, `Must be ${max} characters or fewer.`) });

const LONG = 20000;
const SHORT = 600;

export function buildPageSchema(def: PageDef) {
  const fields = z.object(
    Object.fromEntries(def.fields.map((field) => [field.name, localized(field.kind === "text" ? SHORT : LONG)])),
  );
  const plain = z.object(
    Object.fromEntries(
      def.plain.map((field) => {
        let schema = z.string().trim().max(field.kind === "plainLines" ? LONG : 2000);
        if (field.type === "url") {
          schema = schema.refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), "Must start with https://");
        }
        return [field.name, schema];
      }),
    ),
  );
  const cards = z.object(
    Object.fromEntries(
      def.cards.map((list) => [
        list.name,
        z.array(z.object({ title: localized(SHORT), body: localized(LONG), items: localized(LONG) })).max(60),
      ]),
    ),
  );
  const links = z.object(
    Object.fromEntries(
      def.links.map((list) => [
        list.name,
        z
          .array(
            z.object({
              label: localized(SHORT),
              href: z.string().trim().min(1, "Add the address.").max(2000).refine(isAllowedHref, "Must be a full https:// address or a site path such as /visas."),
            }),
          )
          .max(60),
      ]),
    ),
  );
  const images = z.object(Object.fromEntries(def.images.map((image) => [image.name, newsImageSchema.nullable()])));
  return z.object({ fields, plain, cards, links, images });
}

// ---- helpers for the pages ------------------------------------------------

export function emptyPageContent(): PageContent {
  return { fields: {}, plain: {}, cards: {}, links: {}, images: {} };
}

// Stored content wins; anything missing (for example a field added after the
// page was last saved) comes from the defaults.
export function mergePageContent(defaults: PageContent, stored: Partial<PageContent> | null | undefined): PageContent {
  if (!stored) {
    return defaults;
  }
  return {
    fields: { ...defaults.fields, ...(stored.fields ?? {}) },
    plain: { ...defaults.plain, ...(stored.plain ?? {}) },
    cards: { ...defaults.cards, ...(stored.cards ?? {}) },
    links: { ...defaults.links, ...(stored.links ?? {}) },
    images: { ...defaults.images, ...(stored.images ?? {}) },
  };
}

export function tx(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) {
    return "";
  }
  return text[locale] || text.en;
}

export function linesOf(text: LocalizedText | string | undefined, locale: Locale): string[] {
  const raw = typeof text === "string" ? text : tx(text, locale);
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function plainLines(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
