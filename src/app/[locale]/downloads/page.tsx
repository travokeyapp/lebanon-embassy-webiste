import Link from "next/link";
import SiteShell from "@/components/site-shell";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  documentKindLabel,
  formatFileSize,
  type DocumentRecord,
} from "@/lib/content/documents-schema";
import { getPublicDocuments } from "@/lib/content/documents-public";
import { normalizeLocale } from "@/lib/locale";

const copy = {
  en: {
    title: "Forms & Documents",
    lead: "Official forms, brochures and documents published by the Embassy. Open a file to view or download it.",
    open: "Open",
    empty: "No documents are available at the moment.",
    backHome: "Back to Home",
  },
  ar: {
    title: "النماذج والمستندات",
    lead: "النماذج الرسمية والكتيبات والمستندات الصادرة عن السفارة. افتح الملف لعرضه أو تنزيله.",
    open: "فتح",
    empty: "لا توجد مستندات متاحة حاليًا.",
    backHome: "العودة إلى الرئيسية",
  },
};

function pick(text: { en: string; ar: string }, locale: "en" | "ar"): string {
  return text[locale] || text.en;
}

// Managed in the admin under Documents & forms.
export default async function DownloadsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = copy[locale];
  const documents = await getPublicDocuments();
  const groups = DOCUMENT_CATEGORIES.map((category) => ({
    category,
    label: DOCUMENT_CATEGORY_LABELS[category][locale],
    items: documents.filter((doc: DocumentRecord) => doc.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <header className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </header>

        {groups.length === 0 ? (
          <div className="noticeBox">{t.empty}</div>
        ) : (
          groups.map((group) => (
            <article className="card stack" key={group.category}>
              <h3>{group.label}</h3>
              <ul className="documentList">
                {group.items.map((doc) => (
                  <li className="documentItem" key={doc.id}>
                    <div className="documentInfo">
                      <span className="documentTitle">{pick(doc.title, locale)}</span>
                      {pick(doc.description, locale) ? <span className="documentDescription">{pick(doc.description, locale)}</span> : null}
                      <span className="documentMeta">
                        {documentKindLabel(doc, locale)}
                        {doc.size ? ` · ${formatFileSize(doc.size)}` : ""}
                      </span>
                    </div>
                    <a className="downloadButton" href={doc.href} target="_blank" rel="noreferrer">
                      {t.open}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}

        <p>
          <Link className="newsBackHomeLink" href={`/${locale}`}>
            {t.backHome}
          </Link>
        </p>
      </section>
    </SiteShell>
  );
}
