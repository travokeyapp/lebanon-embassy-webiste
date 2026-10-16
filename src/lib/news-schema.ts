import { z } from "zod";
import { NEWS_DATE_PATTERN } from "@/lib/news-dates";

// Shared between the admin form (client-side checks) and the server actions
// (authoritative validation). Keep it free of server-only imports.

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_GALLERY_IMAGES = 12;
export const NEWS_STATUSES = ["draft", "published"] as const;
export type NewsStatus = (typeof NEWS_STATUSES)[number];

function isAllowedHref(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value) || (value.startsWith("/") && !value.startsWith("//"));
}

const text = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer.`);
const localizedText = (max: number) => z.object({ en: text(max), ar: text(max) });

export const newsImageSchema = z.object({
  src: z.string().trim().min(1).max(2000).refine(isAllowedHref, "Image address must be a full URL or a site path."),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: localizedText(300),
});

export const newsAttachmentSchema = z.object({
  href: z
    .string()
    .trim()
    .min(1, "Add a link or upload a file.")
    .max(2000)
    .refine(isAllowedHref, "Link must start with https:// (or be a site path)."),
  label: localizedText(200),
});

export const newsInputSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Slug must be at least 3 characters.")
      .max(160, "Slug must be 160 characters or fewer.")
      .regex(SLUG_PATTERN, "Slug may only contain lowercase letters, numbers and single hyphens."),
    date: z.string().regex(NEWS_DATE_PATTERN, "Choose a valid date."),
    status: z.enum(NEWS_STATUSES),
    title: localizedText(400),
    excerpt: localizedText(5000),
    image: newsImageSchema.nullable(),
    gallery: z.array(newsImageSchema).max(MAX_GALLERY_IMAGES, `At most ${MAX_GALLERY_IMAGES} gallery photos.`),
    attachment: newsAttachmentSchema.nullable(),
  })
  .superRefine((value, ctx) => {
    const require = (path: (string | number)[], ok: boolean, message: string) => {
      if (!ok) {
        ctx.addIssue({ code: "custom", path, message });
      }
    };

    require(["title", "en"], value.title.en.length > 0, "English title is required.");

    if (value.status === "published") {
      require(["title", "ar"], value.title.ar.length > 0, "Arabic title is required to publish.");
      require(["excerpt", "en"], value.excerpt.en.length > 0, "English text is required to publish.");
      require(["excerpt", "ar"], value.excerpt.ar.length > 0, "Arabic text is required to publish.");
      if (value.attachment) {
        require(
          ["attachment", "label", "en"],
          value.attachment.label.en.length > 0,
          "English link label is required to publish.",
        );
        require(
          ["attachment", "label", "ar"],
          value.attachment.label.ar.length > 0,
          "Arabic link label is required to publish.",
        );
      }
    }
  });

export type NewsInput = z.infer<typeof newsInputSchema>;
export type NewsImageInput = z.infer<typeof newsImageSchema>;
export type NewsAttachmentInput = z.infer<typeof newsAttachmentSchema>;

export type FieldErrors = Record<string, string>;

export function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}
