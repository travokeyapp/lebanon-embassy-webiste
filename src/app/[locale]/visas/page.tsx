import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

const content = {
  en: {
    title: "Visa Services",
    lead: "The Consular Section handles visa applications for eligible travelers to Lebanon. Applicants should submit complete documentation and apply early.",
    categoriesTitle: "Visa Categories",
    categories: [
      {
        title: "Tourist Visa",
        detail: "For short-term visits, family trips, and cultural travel.",
      },
      {
        title: "Business Visa",
        detail: "For meetings, conferences, and professional activities in Lebanon.",
      },
      {
        title: "Transit Visa",
        detail: "For brief stopovers where entry authorization is required.",
      },
    ],
    requiredTitle: "Required Documents",
    required: [
      "Completed visa application form.",
      "Valid passport with sufficient validity period.",
      "Recent passport-size photographs.",
      "Travel itinerary and proof of accommodation.",
      "Supporting financial or sponsorship documents, if requested.",
    ],
    processTitle: "Application Process",
    process: [
      "Prepare all documents according to the relevant visa category.",
      "Submit the application at the Embassy during working hours.",
      "Wait for consular review and possible follow-up requests.",
      "Collect passport and decision on the communicated date.",
    ],
    downloadTitle: "Forms Download",
    downloadHint: "Use the official visa form before submitting your application:",
    formJpg: "Visa Form (JPG)",
    formPdf: "Visa Form (PDF)",
    contactTitle: "Need Assistance?",
    contactBody:
      "For updated requirements, processing times, and special cases, contact the Consular Section directly before filing your application.",
  },
  ar: {
    title: "خدمات التأشيرات",
    lead: "يتولى القسم القنصلي معاملات التأشيرات للمسافرين المؤهلين إلى لبنان. يرجى تقديم ملف كامل والتقدم مبكرًا قبل موعد السفر.",
    categoriesTitle: "فئات التأشيرات",
    categories: [
      {
        title: "تأشيرة سياحية",
        detail: "للزيارات القصيرة والسياحة والزيارات العائلية.",
      },
      {
        title: "تأشيرة أعمال",
        detail: "للاجتماعات والمؤتمرات والأنشطة المهنية في لبنان.",
      },
      {
        title: "تأشيرة عبور",
        detail: "للتوقفات القصيرة التي تتطلب إذن دخول.",
      },
    ],
    requiredTitle: "المستندات المطلوبة",
    required: [
      "نموذج طلب التأشيرة معبأ بالكامل.",
      "جواز سفر صالح لمدة كافية.",
      "صور شخصية حديثة.",
      "برنامج السفر وإثبات مكان الإقامة.",
      "مستندات مالية أو كفالة عند الطلب.",
    ],
    processTitle: "آلية التقديم",
    process: [
      "تحضير كافة المستندات وفق نوع التأشيرة المطلوب.",
      "تقديم الطلب في السفارة خلال أوقات الدوام.",
      "انتظار المراجعة القنصلية وأي طلبات استكمال إضافية.",
      "استلام الجواز والنتيجة في الموعد المحدد.",
    ],
    downloadTitle: "تنزيل النماذج",
    downloadHint: "يرجى استخدام النموذج الرسمي قبل تقديم الطلب:",
    formJpg: "نموذج التأشيرة (JPG)",
    formPdf: "نموذج التأشيرة (PDF)",
    contactTitle: "بحاجة إلى مساعدة؟",
    contactBody:
      "للاطلاع على المتطلبات المحدثة ومدة المعالجة والحالات الخاصة، يرجى التواصل مع القسم القنصلي قبل تقديم المعاملة.",
  },
};

export default async function VisasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];
  const travelInsuranceRequirement =
    locale === "ar"
      ? "تأمين سفر طبي صالح يغطي كامل مدة الإقامة في لبنان."
      : "Valid travel medical insurance covering the full stay in Lebanon.";
  const requiredDocuments = [...t.required, travelInsuranceRequirement];

  return (
    <SiteShell locale={locale} activeNav="visas">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </div>

        <div className="quickGrid">
          {t.categories.map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.requiredTitle}</h3>
            <ul className="bulletList">
              {requiredDocuments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>{t.processTitle}</h3>
            <ol className="stepList">
              {t.process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </div>

        <div className="contentSplit">
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

          <article className="card">
            <h3>{t.contactTitle}</h3>
            <p>{t.contactBody}</p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
