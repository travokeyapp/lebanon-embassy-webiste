import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

const content = {
  en: {
    title: "Consular Affairs",
    lead: "The Embassy of Lebanon in Islamabad is committed to providing efficient and professional services to Lebanese nationals and the public in Pakistan.",
    cards: [
      {
        title: "Passport Services",
        items: [
          "Renewal processing for biometric and 2003-model passports.",
          "Issuance of emergency travel documents (laissez-passer).",
          "Reporting and replacement procedures for lost passports.",
        ],
      },
      {
        title: "Civil Status Registration",
        items: [
          "Birth registration for children born in Pakistan.",
          "Marriage and divorce registration for official records.",
          "Death registration and repatriation support procedures.",
        ],
      },
      {
        title: "Attestation and Power of Attorney",
        items: [
          "General and special powers of attorney for use in Lebanon.",
          "Commercial document legalization (invoices, certificates of origin).",
          "Attestation of educational and medical documents.",
        ],
      },
    ],
    workflowTitle: "Application Workflow",
    workflowLead: "To avoid delays, please follow the standard legalization process:",
    workflowSteps: [
      "Prepare complete originals and supporting copies.",
      "Obtain prior attestation from the Ministry of Foreign Affairs (MOFA) of Pakistan.",
      "Submit documents to the Consular Section during working hours.",
      "Collect legalized documents on the advised date.",
    ],
    notice:
      "Important: Documents issued by Pakistani authorities must be attested by MOFA Pakistan before embassy legalization.",
  },
  ar: {
    title: "الشؤون القنصلية",
    lead: "تلتزم سفارة لبنان في إسلام أباد بتقديم خدمات قنصلية فعالة ومهنية للمواطنين اللبنانيين وللجمهور في باكستان.",
    cards: [
      {
        title: "خدمات جوازات السفر",
        items: [
          "معاملات تجديد الجوازات البيومترية وجوازات نموذج 2003.",
          "إصدار وثائق سفر اضطرارية (laissez-passer).",
          "إجراءات الإبلاغ عن فقدان الجواز واستبداله.",
        ],
      },
      {
        title: "تسجيل الأحوال الشخصية",
        items: [
          "تسجيل الولادات للأطفال المولودين في باكستان.",
          "تسجيل الزواج والطلاق في السجلات الرسمية.",
          "إجراءات تسجيل الوفاة ودعم نقل الجثمان عند الحاجة.",
        ],
      },
      {
        title: "التصديقات والوكالات",
        items: [
          "تنظيم الوكالات العامة والخاصة للاستعمال في لبنان.",
          "تصديق المستندات التجارية مثل الفواتير وشهادات المنشأ.",
          "تصديق الشهادات التعليمية والتقارير الطبية.",
        ],
      },
    ],
    workflowTitle: "آلية تقديم المعاملات",
    workflowLead: "لتجنب التأخير، يرجى اتباع التسلسل المعتمد للتصديق:",
    workflowSteps: [
      "تحضير المستندات الأصلية وكافة المرفقات المطلوبة.",
      "الحصول على تصديق مسبق من وزارة الخارجية الباكستانية.",
      "تقديم المعاملة لدى القسم القنصلي ضمن أوقات الدوام.",
      "استلام المستندات المصدقة في الموعد المحدد.",
    ],
    notice:
      "مهم: يجب أن تكون المستندات الصادرة عن الجهات الباكستانية مصدقة من وزارة الخارجية الباكستانية قبل تصديقها في السفارة.",
  },
};

export default async function ConsularPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];

  return (
    <SiteShell locale={locale} activeNav="consular">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </div>

        <div className="quickGrid">
          {t.cards.map((block) => (
            <article className="card" key={block.title}>
              <h3>{block.title}</h3>
              <ul className="bulletList">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="contentSplit">
          <article className="card stack">
            <h3>{t.workflowTitle}</h3>
            <p>{t.workflowLead}</p>
            <ol className="stepList">
              {t.workflowSteps.map((step) => (
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
                  , a reputable travel agency, for visa application processing and document attestation services.
                </>
              ) : (
                "توصي سفارة لبنان في إسلام آباد بشركة كراون إنترناشونال ترافلز الخاصة المحدودة، وهي وكالة سفر موثوقة، للمساعدة في إجراءات طلبات التأشيرة وخدمات تصديق المستندات."
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

        <div className="noticeBox">{t.notice}</div>
      </section>
    </SiteShell>
  );
}
