import { z } from "zod";

// The home page hero: two slideshows (Pakistan on the left, Lebanon on the
// right) with exactly four slides each, because the fade animation in the CSS
// is timed for four.

export const HERO_SLIDE_COUNT = 4;
export const HERO_GROUPS = ["pakistan", "lebanon"] as const;
export type HeroGroup = (typeof HERO_GROUPS)[number];
export const HERO_FITS = ["cover", "contain"] as const;
export type HeroFit = (typeof HERO_FITS)[number];

const localized = (max: number) =>
  z.object({ en: z.string().trim().max(max, `Must be ${max} characters or fewer.`), ar: z.string().trim().max(max, `Must be ${max} characters or fewer.`) });

export const heroSlideSchema = z.object({
  image: z.object({
    src: z.string().trim().min(1, "Choose a picture.").max(2000),
    width: z.number().int().nonnegative(),
    height: z.number().int().nonnegative(),
  }),
  fit: z.enum(HERO_FITS),
  // A CSS background-position such as "center" or "center 60%".
  position: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z0-9% .-]*$/i, "Use words like center, top, bottom or percentages such as 'center 60%'.")
    .transform((value) => value || "center"),
  title: localized(120),
  subtitle: localized(240),
});

export const heroContentSchema = z.object({
  pakistan: z.array(heroSlideSchema).length(HERO_SLIDE_COUNT, `Exactly ${HERO_SLIDE_COUNT} slides are needed.`),
  lebanon: z.array(heroSlideSchema).length(HERO_SLIDE_COUNT, `Exactly ${HERO_SLIDE_COUNT} slides are needed.`),
});

export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type HeroContent = z.infer<typeof heroContentSchema>;
