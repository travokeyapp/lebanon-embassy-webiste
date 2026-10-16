import HydrationSafeImage from "@/components/hydration-safe-image";
import SiteShell from "@/components/site-shell";
import { linesOf, tx } from "@/lib/content/page-schema";
import { getPageContent } from "@/lib/content/pages-public";
import { normalizeLocale } from "@/lib/locale";

// Text and portrait are managed in the admin under Pages → The Ambassador.
export default async function AmbassadorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { fields, images } = await getPageContent("ambassador");
  const portrait = images.portrait;

  return (
    <SiteShell locale={locale} activeNav="ambassador">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{tx(fields.title, locale)}</h2>
          <p className="sectionLead">{tx(fields.subtitle, locale)}</p>
        </div>

        <div className="contentSplit contentSplitWide ambassadorLayout">
          <aside className="card">
            {portrait ? (
              <div className="ambassadorPortraitWrap">
                <HydrationSafeImage
                  src={portrait.src}
                  alt={tx(portrait.alt, locale) || tx(fields.name, locale)}
                  width={portrait.width}
                  height={portrait.height}
                  className="ambassadorPortrait"
                  priority
                />
              </div>
            ) : null}
            <h3>{tx(fields.name, locale)}</h3>
            <p className="muted">{tx(fields.role, locale)}</p>
          </aside>

          <article className="card">
            <div className="ambassadorBioBlock">
              <h3 className="ambassadorSubheading">{tx(fields.profileTitle, locale)}</h3>
              <ul className="bulletList">
                {linesOf(fields.profile, locale).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="ambassadorMessageBlock">
              <h3>{tx(fields.messageTitle, locale)}</h3>
              {linesOf(fields.message, locale).map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
              <p className="ambassadorSignatureLead">{tx(fields.signatureLead, locale)}</p>
              <p className="ambassadorSignatureName">{tx(fields.signatureName, locale)}</p>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
