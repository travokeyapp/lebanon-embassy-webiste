// Which parts of the admin a staff member may change. Administrators always
// have everything (and staff management); editors get a subset.
// Client-safe: no server imports.

import type { PageKey } from "@/lib/content/page-schema";

export const AREAS = ["news", "announcements", "banners", "documents", "gallery", "pages", "settings"] as const;
export type Area = (typeof AREAS)[number];

// Either a list of areas or "all" (every area, now and in the future).
export type AreaGrant = Area[] | "all";

export const AREA_LABELS: Record<Area, { label: string; description: string }> = {
  news: { label: "News & Events", description: "Publish and edit news items." },
  announcements: { label: "Announcements", description: "The notice strip shown on every page." },
  banners: { label: "Home banners", description: "The two slideshows on the home page." },
  documents: { label: "Documents & forms", description: "Downloadable forms and documents." },
  gallery: { label: "Gallery", description: "Photos on the Gallery page." },
  pages: { label: "Pages", description: "Services, Consular, Visas, The Ambassador, Relations, About." },
  settings: { label: "Contact & footer", description: "Address, phones, office hours, map, ribbon and footer." },
};

export function isArea(value: unknown): value is Area {
  return typeof value === "string" && (AREAS as readonly string[]).includes(value);
}

// Anything unexpected (older accounts without the field, bad data) means "all".
export function normalizeAreas(value: unknown): AreaGrant {
  if (value === "all" || value === undefined || value === null) {
    return "all";
  }
  if (!Array.isArray(value)) {
    return "all";
  }
  return value.filter(isArea);
}

export function canAccess(user: { role: "admin" | "editor"; areas: AreaGrant }, area: Area): boolean {
  if (user.role === "admin" || user.areas === "all") {
    return true;
  }
  return user.areas.includes(area);
}

export function areaForPageKey(key: PageKey): Area {
  return key === "settings" ? "settings" : "pages";
}

export function describeAreas(user: { role: "admin" | "editor"; areas: AreaGrant }): string {
  if (user.role === "admin") {
    return "Everything, including staff accounts";
  }
  if (user.areas === "all") {
    return "All sections";
  }
  if (user.areas.length === 0) {
    return "No sections (can only sign in)";
  }
  return user.areas.map((area) => AREA_LABELS[area].label).join(", ");
}
