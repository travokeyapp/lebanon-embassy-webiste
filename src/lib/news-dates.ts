import type { Locale } from "@/lib/locale";

// Month labels used on the news cards. Kept as a fixed table (instead of Intl)
// so output is identical on every server and matches the existing site wording.
const MONTH_LABELS: Record<Locale, string[]> = {
  en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  ar: [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
};

const ADMIN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Dates are stored as plain "YYYY-MM-DD" strings so they never shift with time zones.
export const NEWS_DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function formatNewsDate(date: string, locale: Locale): { day: string; month: string } {
  const [, monthPart = "", dayPart = ""] = date.split("-");
  const monthIndex = Number.parseInt(monthPart, 10) - 1;
  return { day: dayPart, month: MONTH_LABELS[locale][monthIndex] ?? "" };
}

export function formatAdminDate(date: string): string {
  const [yearPart = "", monthPart = "", dayPart = ""] = date.split("-");
  const monthIndex = Number.parseInt(monthPart, 10) - 1;
  const month = ADMIN_MONTHS[monthIndex];
  if (!month) {
    return date;
  }
  return `${Number.parseInt(dayPart, 10)} ${month} ${yearPart}`;
}

export const EMBASSY_TIME_ZONE = "Asia/Karachi";

// Today in the embassy's time zone, as YYYY-MM-DD (en-CA formats dates that way).
export function todayIsoDate(timeZone: string = EMBASSY_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

// "16 Oct 2026, 14:05" in the embassy's time zone, for admin lists.
export function formatAdminDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EMBASSY_TIME_ZONE,
  });
}
