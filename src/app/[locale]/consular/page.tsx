import SiteShell from "@/components/site-shell";
import { linesOf, tx } from "@/lib/content/page-schema";
import { getPageContent } from "@/lib/content/pages-public";
import { normalizeLocale } from "@/lib/locale";

// Text is managed in the admin under Pages → Consular. The "Need assistance"
// card names the Embassy's recommended agency and stays in code.
export default async function ConsularPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { fields, cards } = await getPageContent("consular");

  return (
    <SiteShell locale={locale} activeNav="consular">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{tx(fields.title, locale)}</h2>
          <p className="sectionLead">{tx(fields.lead, locale)}</p>
        </div>

        <div className="quickGrid">
          {(cards.cards ?? []).map((block, index) => (
            <article className="card" key={`${index}-${block.title.en}`}>
              <h3>{tx(block.title, locale)}</h3>
              <ul className="bulletList">
                {linesOf(block.items, locale).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="contentSplit">
          <article className="card stack">
            <h3>{tx(fields.workflowTitle, locale)}</h3>
            <p>{tx(fields.workflowLead, locale)}</p>
            <ol className="stepList">
              {linesOf(fields.workflowSteps, locale).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="card stack">
            <h3>{locale === "en" ? "Need Assistance?" : "بحاجة إلى مساعدة؟"}</h3>
            <p>
              {locale === "en" ? (
                <>
                  The Embassy of Lebanon in Islamabad recommends{" "}
                  <a
                    href="https://www.crownintltravels.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="contactLink"
                  >
                    Crown International Travels Pvt. Ltd.
                  </a>
                  , an agency officially authorised by the Embassy, for visa application processing and document attestation services.
                </>
              ) : (
                "توصي سفارة لبنان في إسلام آباد بشركة كراون إنترناشونال ترافلز الخاصة المحدودة، وهي وكالة معتمدة رسمياً من السفارة، للمساعدة في إجراءات طلبات التأشيرة وخدمات تصديق المستندات."
              )}
            </p>

            <div>
              <p className="contactLabel">{locale === "en" ? "Contact" : "للتواصل"}</p>
              <p className="visaSupportContactLine">
                <a href="https://wa.me/923135000666" target="_blank" rel="noreferrer" className="contactLink">
                  {locale === "en" ? "Phone / WhatsApp" : "الهاتف / واتساب"}
                </a>
                :{" "}
                <a href="tel:+923135000666" className="contactLink">
                  +92 313 5000666
                </a>{" "}
                | {locale === "en" ? "UAN" : "الرقم الموحد"}:{" "}
                <a href="tel:+9251111143111" className="contactLink">
                  +92 51 111 143 111
                </a>
              </p>
            </div>
          </article>
        </div>

        {tx(fields.notice, locale) ? <div className="noticeBox">{tx(fields.notice, locale)}</div> : null}
      </section>
    </SiteShell>
  );
}
