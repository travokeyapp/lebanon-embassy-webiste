import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { linesOf, tx } from "@/lib/content/page-schema";
import { getPageContent } from "@/lib/content/pages-public";
import { normalizeLocale } from "@/lib/locale";

function localHref(locale: string, href: string): string {
  if (/^https?:\/\//i.test(href)) {
    return href;
  }
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

// Text is managed in the admin under Pages → Relations.
export default async function RelationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { fields, cards, links } = await getPageContent("relations");

  return (
    <SiteShell locale={locale} activeNav="relations">
      <section className="section container">
        <div className="relationsLayout">
          <article className="relationsMain">
            <h2 className="relationsTitle">{tx(fields.title, locale)}</h2>
            <p className="relationsIntro">{tx(fields.intro, locale)}</p>

            {(cards.sections ?? []).map((section, index) => {
              const bullets = linesOf(section.items, locale);
              return (
                <section className="relationsSection" key={`${index}-${section.title.en}`}>
                  <h3>{tx(section.title, locale)}</h3>
                  {linesOf(section.body, locale).map((paragraph, i) => (
                    <p key={`${i}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                  ))}
                  {bullets.length > 0 ? (
                    <ul className="relationsBullets">
                      {bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}

            {tx(fields.footnote, locale) ? <div className="relationsHighlight">{tx(fields.footnote, locale)}</div> : null}
          </article>

          <aside className="relationsSidebar">
            <section className="relationsSideCard">
              <h3 className="relationsSideTitle">{tx(fields.headOfMissionTitle, locale)}</h3>
              <p className="relationsMissionName">{tx(fields.headName, locale)}</p>
              <p className="relationsMissionRole">{tx(fields.headRole, locale)}</p>
              <Link className="relationsBioButton" href={`/${locale}/ambassador`}>
                {tx(fields.viewBiography, locale)}
              </Link>
            </section>

            <section className="relationsSideCard">
              <h3 className="relationsSideTitle">{tx(fields.quickLinksTitle, locale)}</h3>
              <ul className="relationsQuickLinks">
                {(links.quickLinks ?? []).map((item, index) => (
                  <li key={`${index}-${item.href}`}>
                    <Link href={localHref(locale, item.href)}>{tx(item.label, locale)}</Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
