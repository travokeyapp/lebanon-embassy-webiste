import { z } from "zod";
import { NEWS_DATE_PATTERN } from "@/lib/news-dates";

// Short notices shown in a strip under the site header on every page, for
// example a holiday closure or an urgent consular message.

export const ANNOUNCEMENT_TONES = ["info", "alert"] as const;
export type AnnouncementTone = (typeof ANNOUNCEMENT_TONES)[number];

const localized = (max: number) =>
  z.object({ en: z.string().trim().max(max, `Must be ${max} characters or fewer.`), ar: z.string().trim().max(max, `Must be ${max} characters or fewer.`) });

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || NEWS_DATE_PATTERN.test(value), "Choose a valid date.")
  .transform((value) => (value === "" ? null : value));

function isAllowedHref(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value) || (value.startsWith("/") && !value.startsWith("//")) || /^(mailto|tel):/i.test(value);
}

export const announcementInputSchema = z
  .object({
    text: localized(600),
    tone: z.enum(ANNOUNCEMENT_TONES),
    linkHref: z
      .string()
      .trim()
      .max(2000)
      .refine((value) => value === "" || isAllowedHref(value), "Must be a full https:// address or a site path such as /visas.")
      .transform((value) => (value === "" ? null : value)),
    linkLabel: localized(200),
    startsAt: optionalDate,
    endsAt: optionalDate,
    active: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.text.en) {
      ctx.addIssue({ code: "custom", path: ["text", "en"], message: "English text is required." });
    }
    if (value.linkHref && !value.linkLabel.en) {
      ctx.addIssue({ code: "custom", path: ["linkLabel", "en"], message: "Add the link text in English." });
    }
    if (value.startsAt && value.endsAt && value.endsAt < value.startsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "The end date is before the start date." });
    }
  });

export type AnnouncementInput = z.infer<typeof announcementInputSchema>;

export type AnnouncementRecord = {
  id: string;
  text: { en: string; ar: string };
  tone: AnnouncementTone;
  linkHref: string | null;
  linkLabel: { en: string; ar: string };
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type AnnouncementState = "live" | "scheduled" | "expired" | "off";

// Whether a notice is on the website on a given day (YYYY-MM-DD).
export function announcementState(item: Pick<AnnouncementRecord, "active" | "startsAt" | "endsAt">, today: string): AnnouncementState {
  if (!item.active) {
    return "off";
  }
  if (item.startsAt && today < item.startsAt) {
    return "scheduled";
  }
  if (item.endsAt && today > item.endsAt) {
    return "expired";
  }
  return "live";
}
