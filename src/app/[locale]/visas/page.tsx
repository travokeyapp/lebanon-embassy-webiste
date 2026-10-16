import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { getPublicDocuments } from "@/lib/content/documents-public";
import { linesOf, tx } from "@/lib/content/page-schema";
import { getPageContent } from "@/lib/content/pages-public";
import { normalizeLocale } from "@/lib/locale";

type AgencyContent = {
  title: string;
  introBefore: string;
  introAfter: string;
  servicesTitle: string;
  services: string[];
  contactTitle: string;
  phoneWhatsappLabel: string;
  callLabel: string;
  uanLabel: string;
};

const agencyContent: Record<"en" | "ar", AgencyContent> = {
  en: {
    title: "Recommended Visa & Tourism Agency",
    introBefore: "As recommended by the Embassy of Lebanon in Islamabad,",
    introAfter: "is an officially authorised travel agency supporting tourism and visa procedures for Lebanon.",
    servicesTitle: "Services Offered",
    services: [
      "Visa Application Submission & Collection",
      "Document Attestation Services",
    ],
    contactTitle: "Contact",
    phoneWhatsappLabel: "Phone / WhatsApp",
    callLabel: "Call",
    uanLabel: "UAN",
  },
  ar: {
    title: "الوكالة الموصى بها للتأشيرات والسياحة",
    introBefore: "بناءً على التوصية الرسمية من سفارة لبنان في إسلام آباد،",
    introAfter: "وكالة سفر معتمدة رسمياً، شريك في تعزيز السياحة وتسهيل إجراءات التأشيرة إلى لبنان.",
    servicesTitle: "تشمل خدماتنا:",
    services: [
      "التقديم والاستلام الرسمي للتأشيرة",
      "استشارات مهنية للتأشيرات",
      "باقات سياحية مخصصة إلى لبنان",
    ],
    contactTitle: "للتواصل لخدمات التأشيرة والسياحة:",
    phoneWhatsappLabel: "الهاتف/واتساب",
    callLabel: "اتصال",
    uanLabel: "الرقم الموحد",
  },
};

export default async function VisasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const [{ fields, cards }, documents] = await Promise.all([getPageContent("visas"), getPublicDocuments()]);
  const visaForms = documents.filter((doc) => doc.category === "visa-forms");
  const agency = agencyContent[locale];
  const t = (name: string) => tx(fields[name], locale);
  const list = (name: string) => linesOf(fields[name], locale).map((item) => <li key={item}>{item}</li>);

  return (
    <SiteShell locale={locale} activeNav="visas">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{t("title")}</h2>
          <p className="sectionLead">{t("lead")}</p>
        </div>

        <article className="card stack">
          <h3>{t("categoriesTitle")}</h3>
          <div className="quickGrid">
            {(cards.categories ?? []).map((item, index) => (
              <article className="card" key={`${index}-${item.title.en}`}>
                <h3>{tx(item.title, locale)}</h3>
                <p>{tx(item.body, locale)}</p>
              </article>
            ))}
          </div>
        </article>

        <div className="contentSplit">
          <article className="card">
            <h3>{t("requiredTitle")}</h3>
            <ul className="bulletList">{list("required")}</ul>
          </article>

          <article className="card">
            <h3>{t("specialCasesTitle")}</h3>
            <ul className="bulletList">{list("specialCases")}</ul>
          </article>
        </div>

        <article className="card stack">
          <h3>{t("visaSpecificTitle")}</h3>
          <div className="quickGrid">
            {(cards.visaSpecific ?? []).map((item, index) => (
              <article className="card" key={`${index}-${item.title.en}`}>
                <h3>{tx(item.title, locale)}</h3>
                <ul className="bulletList">
                  {linesOf(item.items, locale).map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>

        <div className="contentSplit">
          <article className="card">
            <h3>{t("feeTitle")}</h3>
            <ul className="bulletList">{list("fees")}</ul>
          </article>

          <article className="card">
            <h3>{t("notesTitle")}</h3>
            <ul className="bulletList">{list("notes")}</ul>
          </article>
        </div>

        <div className="contentSplit">
          <article className="card">
            <h3>{t("processTitle")}</h3>
            <ol className="stepList">{list("process")}</ol>
          </article>

          <article className="card stack">
            <h3>{t("downloadTitle")}</h3>
            <p>{t("downloadHint")}</p>
            <div className="downloadActions">
              {visaForms.map((doc) => (
                <a className="downloadButton" href={doc.href} target="_blank" rel="noreferrer" key={doc.id}>
                  {doc.title[locale] || doc.title.en}
                </a>
              ))}
            </div>
            <p>
              <Link className="contactLink" href={`/${locale}/downloads`}>
                {locale === "en" ? "All forms and documents" : "جميع النماذج والمستندات"}
              </Link>
            </p>
          </article>
        </div>

        <article className="card stack visaSupportCard">
          <h3>{t("contactTitle")}</h3>
          {locale === "en" ? (
            <p>
              The Embassy of Lebanon in Islamabad recommends{" "}
              <a href="https://www.crownintltravels.com/" target="_blank" rel="noreferrer" className="contactLink">
                Crown International Travels Pvt. Ltd.
              </a>
              , an agency officially authorised by the Embassy, for visa application processing and document attestation services.
            </p>
          ) : (
            <p>{t("contactBody")}</p>
          )}

          <div>
            <p className="contactLabel">{agency.contactTitle}</p>
            <p className="visaSupportContactLine">
              <a href="https://wa.me/923135000666" target="_blank" rel="noreferrer" className="contactLink">
                {agency.phoneWhatsappLabel}
              </a>
              :{" "}
              <a href="tel:+923135000666" className="contactLink">
                +92 313 5000666
              </a>{" "}
              | {agency.uanLabel}:{" "}
              <a href="tel:+9251111143111" className="contactLink">
                +92 51 111 143 111
              </a>
            </p>
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
