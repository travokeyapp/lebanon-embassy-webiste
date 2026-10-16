import { HERO_DEFAULTS } from "@/lib/content/hero-public";
import type { HeroContent } from "@/lib/content/hero-schema";
import { getStoredHero } from "@/lib/content/hero-store";
import { formatAdminDateTime } from "@/lib/news-dates";
import HeroForm from "./hero-form";
import { requireArea } from "@/lib/auth/session";

export default async function BannersPage() {
  await requireArea("banners");
  let content: HeroContent = HERO_DEFAULTS;
  let info: string | null = null;
  let loadError: string | null = null;
  try {
    const stored = await getStoredHero();
    if (stored) {
      content = stored.content;
      info = `Last saved ${formatAdminDateTime(stored.updatedAt.toISOString())} by ${stored.updatedBy}.`;
    } else {
      info = "Showing the original banners. Saving creates the editable copy.";
    }
  } catch (error) {
    console.error("Loading hero for admin failed:", error);
    loadError = "Could not load the saved banners from the database; showing the originals. Saving will fail until the database is reachable.";
  }

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Home banners</h1>
          <p className="admMuted">The two slideshows at the top of the home page.</p>
          {info ? <p className="admMuted admSmall">{info}</p> : null}
        </div>
        <a className="admBtn admBtnGhost" href="/en" target="_blank" rel="noreferrer">
          View home page
        </a>
      </header>
      {loadError ? (
        <p className="admAlert admAlertError" role="alert">
          {loadError}
        </p>
      ) : null}
      <HeroForm initial={content} defaults={HERO_DEFAULTS} />
    </>
  );
}
