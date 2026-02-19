export type Locale = "en" | "ar";

export function normalizeLocale(locale: string): Locale {
  return locale === "ar" ? "ar" : "en";
}
