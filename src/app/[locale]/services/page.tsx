import SiteShell from "@/components/site-shell";
import { linesOf, tx } from "@/lib/content/page-schema";
import { getPageContent } from "@/lib/content/pages-public";
import { normalizeLocale } from "@/lib/locale";

// Text is managed in the admin under Pages → Services.
export default async function Services({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { fields, cards } = await getPageContent("services");

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <header className="pageHeader">
          <h2 className="pageTitle">{tx(fields.title, locale)}</h2>
          <p className="sectionLead">{tx(fields.lead, locale)}</p>
        </header>

        <div className="quickGrid">
          {(cards.cards ?? []).map((card, index) => (
            <article className="card" key={`${index}-${card.title.en}`}>
              <h3>{tx(card.title, locale)}</h3>
              <ul className="bulletList">
                {linesOf(card.items, locale).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {tx(fields.note, locale) ? <div className="noticeBox">{tx(fields.note, locale)}</div> : null}
      </section>
    </SiteShell>
  );
}
