import { z } from "zod";
import { newsImageSchema } from "@/lib/news-schema";

// Photo gallery: pictures with a collection, a date label, a title and a caption.

export const GALLERY_COLLECTIONS = ["diplomatic", "national", "consular", "cultural"] as const;
export type GalleryCollection = (typeof GALLERY_COLLECTIONS)[number];

export const GALLERY_COLLECTION_LABELS: Record<GalleryCollection, { en: string; ar: string }> = {
  diplomatic: { en: "Diplomatic Meetings", ar: "اللقاءات الدبلوماسية" },
  national: { en: "National Events", ar: "الفعاليات الوطنية" },
  consular: { en: "Consular Outreach", ar: "التواصل القنصلي" },
  cultural: { en: "Cultural Programs", ar: "البرامج الثقافية" },
};

export const GALLERY_TONES = ["galleryToneRed", "galleryToneGreen", "galleryToneCharcoal", "galleryToneSand"] as const;
export type GalleryTone = (typeof GALLERY_TONES)[number];

const localized = (max: number) =>
  z.object({ en: z.string().trim().max(max, `Must be ${max} characters or fewer.`), ar: z.string().trim().max(max, `Must be ${max} characters or fewer.`) });

export const galleryInputSchema = z
  .object({
    image: newsImageSchema.nullable(),
    collection: z.enum(GALLERY_COLLECTIONS),
    date: localized(60),
    title: localized(200),
    caption: localized(600),
    visible: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.title.en) {
      ctx.addIssue({ code: "custom", path: ["title", "en"], message: "English title is required." });
    }
    if (!value.image) {
      ctx.addIssue({ code: "custom", path: ["image"], message: "Choose a photo." });
    }
  });

export type GalleryInput = z.infer<typeof galleryInputSchema>;

export type GalleryRecord = GalleryInput & {
  id: string;
  order: number;
  // Only the built-in placeholder items use a tone instead of a photo.
  toneClass?: GalleryTone;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};
