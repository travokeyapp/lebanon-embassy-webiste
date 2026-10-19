import SiteShell from "@/components/site-shell";
import { linesOf, tx } from "@/lib/content/page-schema";
import { getPageContent } from "@/lib/content/pages-public";
import { normalizeLocale } from "@/lib/locale";

// Text is managed in the admin under Pages → About.
export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { fields } = await getPageContent("about");

  const list = (name: string) => linesOf(fields[name], locale).map((item) => <li key={item}>{item}</li>);

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <header className="pageHeader">
          <h2 className="pageTitle">{tx(fields.title, locale)}</h2>
          <p className="sectionLead">{tx(fields.lead, locale)}</p>
        </header>

        <div className="contentSplit">
          <article className="card">
            <h3>{tx(fields.missionTitle, locale)}</h3>
            <ul className="bulletList">{list("mission")}</ul>
          </article>

          <article className="card">
            <h3>{tx(fields.servicesTitle, locale)}</h3>
            <ul className="bulletList">{list("services")}</ul>
          </article>
        </div>

        <article className="card stack">
          <h3>{tx(fields.milestonesTitle, locale)}</h3>
          <ul className="bulletList">{list("milestones")}</ul>
        </article>

        {tx(fields.note, locale) ? <div className="noticeBox">{tx(fields.note, locale)}</div> : null}
      </section>
    </SiteShell>
  );
}
