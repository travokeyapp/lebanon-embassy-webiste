import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

type VisaCategory = {
  title: string;
  detail: string;
};

type VisaSpecific = {
  title: string;
  items: string[];
};

type VisaPageContent = {
  title: string;
  lead: string;
  categoriesTitle: string;
  categories: VisaCategory[];
  requiredTitle: string;
  required: string[];
  specialCasesTitle: string;
  specialCases: string[];
  visaSpecificTitle: string;
  visaSpecific: VisaSpecific[];
  feeTitle: string;
  fees: string[];
  processTitle: string;
  process: string[];
  notesTitle: string;
  notes: string[];
  downloadTitle: string;
  downloadHint: string;
  formJpg: string;
  formPdf: string;
  contactTitle: string;
  contactBody: string;
};

const sharedContent: VisaPageContent = {
  title: "Visa Services",
  lead: "The following requirements are based on the official guidance provided by the Embassy of Lebanon in Islamabad. Submit complete documents according to your visa type.",
  categoriesTitle: "Visa Categories",
  categories: [
    {
      title: "Business Visa",
      detail: "For meetings and business-related travel to Lebanon.",
    },
    {
      title: "Tourist Visa",
      detail: "For short visits and tourism purposes.",
    },
    {
      title: "Family Visit",
      detail: "For visiting family members in Lebanon.",
    },
    {
      title: "Medical Treatment Visit",
      detail: "For medical consultations and treatment in Lebanon.",
    },
    {
      title: "Training Course Visit",
      detail: "For attending training courses in Lebanon.",
    },
    {
      title: "Transit Visa",
      detail: "For transiting via Lebanon to another destination.",
    },
    {
      title: "Study Visit",
      detail: "For study and educational enrollment in Lebanon.",
    },
  ],
  requiredTitle: "Core Required Documents",
  required: [
    "Visa application form completed clearly in capital letters (typed or handwritten) exactly as per passport details.",
    "Colored passport copies (up to page 3 for Business Visa; passport copies required for other visa types).",
    "Recent photograph with white background.",
    "Medical travel insurance.",
    "Hotel reservation OR clear residence address and telephone numbers with sponsor letter.",
    "If sponsor is Lebanese: attach sponsor passport copy, ID card copy, and registration certificate copy.",
    "If sponsor is a foreigner: attach sponsor residence permit valid for at least 3 months.",
    "Tentative flight reservation showing arrival and departure.",
    "Bank statement for the last 3 months OR proof of sufficient funds for stay in Lebanon.",
    "Document proving applicant status (employee, student, retired, company owner).",
    "If not working: provide financial proof documents.",
    "For applicants not residing in their own country: residence permit valid for more than 6 months.",
  ],
  specialCasesTitle: "Special Cases for Travel/Residence Documents",
  specialCases: [
    "Egyptian travel document holders residing in Egypt: residence permit valid for more than 6 months plus Egypt re-entry visa.",
    "Palestinian Authority citizens residing in occupied Palestine: recently issued permission to return to authority territories.",
    "Palestinian Authority and Jordanian applicants without national number residing in occupied Palestine: recently issued permission to return to authority territories.",
    "Holders of travel document (FREMMEDPAS): copy of re-entry document and residence permit valid for at least 6 months.",
  ],
  visaSpecificTitle: "Additional Documents by Visa Type",
  visaSpecific: [
    {
      title: "Business Visa",
      items: [
        "Invitation letter from business partner in Lebanon addressed to Lebanese Embassy, Islamabad, sent directly by email from Lebanon, including duration of stay and inviter contact details.",
        "Copy of business/chamber membership of the invitee.",
        "Proof of business relationship with invitee.",
        "Recommendation note from CCI, FPCCI, or EPB plus membership certificate valid for the current year (two copies).",
        "If approved by the Embassy: attach non-refundable, non-transferable return ticket (two copies).",
      ],
    },
    {
      title: "Tourist Visa",
      items: ["Apply with the core required documents listed above."],
    },
    {
      title: "Family Visit",
      items: [
        "All Tourist Visa/core documents.",
        "Proof of family relationship (birth certificate, marriage certificate, or registration certificate).",
      ],
    },
    {
      title: "Medical Treatment Visit",
      items: [
        "All Tourist Visa/core documents.",
        "Medical reports of the patient and statement/schedule from the concerned doctor indicating required treatment period in Lebanon.",
      ],
    },
    {
      title: "Training Course Visit",
      items: [
        "All Tourist Visa/core documents.",
        "Invitation letter with course program and training duration.",
      ],
    },
    {
      title: "Transit Visa",
      items: [
        "Visa or residence permit of the destination country.",
        "Reservation/ticket for the destination country.",
      ],
    },
    {
      title: "Study Visit",
      items: [
        "Admission documents from officially approved universities, schools, or institutions in Lebanon, or invitation letter from them.",
        "Proof of sufficient funds for study and routine expenses during stay in Lebanon.",
        "Scholarship holders may present scholarship acceptance letter and may be exempted from producing admission and study-financing documents.",
      ],
    },
  ],
  feeTitle: "Business Visa Fees (Cash, After Approval)",
  fees: ["Single Entry: USD 88", "Two Entries: USD 125", "Multiple Entries: USD 175"],
  processTitle: "Application Process",
  process: [
    "Prepare the full document set according to your visa category.",
    "Submit the application at the Embassy during working hours.",
    "Wait for consular review and any additional document requests.",
    "If approved, complete any final submission requirements (such as return ticket copies and applicable fee payment) before visa issuance.",
  ],
  notesTitle: "Important Notes",
  notes: [
    "All required documents must be presented in Arabic, French, or English.",
    "The Directorate General of General Security may request additional documents whenever deemed necessary.",
  ],
  downloadTitle: "Forms Download",
  downloadHint: "Use the official visa form before submitting your application:",
  formJpg: "Visa Form (JPG)",
  formPdf: "Visa Form (PDF)",
  contactTitle: "Need Assistance?",
  contactBody:
    "For updated requirements, processing times, and special cases, contact the Consular Section directly before filing your application.",
};

const content: Record<"en" | "ar", VisaPageContent> = {
  en: sharedContent,
  ar: sharedContent,
};

export default async function VisasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];

  return (
    <SiteShell locale={locale} activeNav="visas">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </div>

        <article className="card stack">
          <h3>{t.categoriesTitle}</h3>
          <div className="quickGrid">
            {t.categories.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </article>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.requiredTitle}</h3>
            <ul className="bulletList">
              {t.required.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>{t.specialCasesTitle}</h3>
            <ul className="bulletList">
              {t.specialCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <article className="card stack">
          <h3>{t.visaSpecificTitle}</h3>
          <div className="quickGrid">
            {t.visaSpecific.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <ul className="bulletList">
                  {item.items.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.feeTitle}</h3>
            <ul className="bulletList">
              {t.fees.map((fee) => (
                <li key={fee}>{fee}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>{t.notesTitle}</h3>
            <ul className="bulletList">
              {t.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.processTitle}</h3>
            <ol className="stepList">
              {t.process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="card stack">
            <h3>{t.downloadTitle}</h3>
            <p>{t.downloadHint}</p>
            <div className="downloadActions">
              <a className="downloadButton" href="/visa-form.jpg" target="_blank" rel="noreferrer">
                {t.formJpg}
              </a>
              <a className="downloadButton" href="/visa-form.pdf" target="_blank" rel="noreferrer">
                {t.formPdf}
              </a>
            </div>
          </article>
        </div>

        <article className="card stack">
          <h3>{t.contactTitle}</h3>
          <p>{t.contactBody}</p>
        </article>
      </section>
    </SiteShell>
  );
}
