import { z } from "zod";
import type { Locale } from "@/lib/locale";

// Downloadable forms and documents (visa form, brochures, notices).

export const DOCUMENT_CATEGORIES = ["visa-forms", "consular-forms", "brochures", "other"] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, { en: string; ar: string }> = {
  "visa-forms": { en: "Visa forms", ar: "نماذج التأشيرات" },
  "consular-forms": { en: "Consular forms", ar: "النماذج القنصلية" },
  brochures: { en: "Brochures & publications", ar: "كتيبات ومنشورات" },
  other: { en: "Other documents", ar: "مستندات أخرى" },
};

const localized = (max: number) =>
  z.object({ en: z.string().trim().max(max, `Must be ${max} characters or fewer.`), ar: z.string().trim().max(max, `Must be ${max} characters or fewer.`) });

function isAllowedHref(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value) || (value.startsWith("/") && !value.startsWith("//"));
}

export const documentInputSchema = z
  .object({
    title: localized(200),
    description: localized(600),
    category: z.enum(DOCUMENT_CATEGORIES),
    href: z.string().trim().min(1, "Upload a file or paste a link.").max(2000).refine(isAllowedHref, "Must be a full https:// address or a site path."),
    fileName: z.string().trim().max(300),
    contentType: z.string().trim().max(100),
    size: z.number().int().nonnegative(),
    visible: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.title.en) {
      ctx.addIssue({ code: "custom", path: ["title", "en"], message: "English title is required." });
    }
  });

export type DocumentInput = z.infer<typeof documentInputSchema>;

export type DocumentRecord = DocumentInput & {
  id: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export function documentKindLabel(doc: Pick<DocumentRecord, "contentType" | "href">, locale: Locale): string {
  const pdf = doc.contentType === "application/pdf" || /\.pdf(\?|$)/i.test(doc.href);
  if (pdf) {
    return "PDF";
  }
  if (/^image\//.test(doc.contentType) || /\.(jpe?g|png|webp)(\?|$)/i.test(doc.href)) {
    return locale === "ar" ? "صورة" : "Image";
  }
  return locale === "ar" ? "رابط" : "Link";
}

export function formatFileSize(bytes: number): string {
  if (!bytes) {
    return "";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
