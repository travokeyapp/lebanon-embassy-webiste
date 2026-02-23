import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

const text = {
  en: {
    title: "Embassy Services",
    lead: "Core services provided by the Embassy of Lebanon in Islamabad for travelers, Lebanese nationals, and document processing.",
    cards: [
      {
        title: "Visa Services",
        items: [
          "Guidance for visa applications before travel to Lebanon.",
          "Common categories include tourist, business, work, student, family, and transit visas.",
          "Applicants should file complete documents in advance to avoid travel delays.",
        ],
      },
      {
        title: "Consular Legalization",
        items: [
          "Attestation of powers of attorney and legal declarations.",
          "Legalization of educational, commercial, and civil-status documents.",
          "Verification workflow may require prior attestation by relevant local authorities.",
        ],
      },
      {
        title: "Citizen and Civil Services",
        items: [
          "Civil-status support including birth, marriage, and other record-related requests.",
          "Passport and travel-document guidance for Lebanese citizens.",
          "Case-specific support for urgent consular queries.",
        ],
      },
    ],
    note:
      "Final requirements may vary by case. Applicants should confirm the latest official checklist with the Embassy before submission.",
  },
  ar: {
    title: "خدمات السفارة",
    lead: "الخدمات الأساسية التي تقدمها سفارة لبنان في إسلام أباد للمسافرين والمواطنين اللبنانيين ومعاملات المستندات.",
    cards: [
      {
        title: "خدمات التأشيرات",
        items: [
          "إرشادات التقديم على التأشيرات قبل السفر إلى لبنان.",
          "تشمل الفئات الشائعة: السياحية، الأعمال، العمل، الدراسة، العائلية، والعبور.",
          "يُنصح بتقديم ملف كامل مبكرًا لتجنب أي تأخير في السفر.",
        ],
      },
      {
        title: "التصديقات القنصلية",
        items: [
          "تصديق الوكالات والإقرارات القانونية.",
          "تصديق الشهادات التعليمية والمستندات التجارية ووثائق الأحوال الشخصية.",
          "قد تتطلب المعاملة تصديقًا مسبقًا من الجهات المحلية المختصة.",
        ],
      },
      {
        title: "خدمات المواطنين والأحوال الشخصية",
        items: [
          "المساعدة في معاملات الأحوال الشخصية مثل الولادات والزواج وغيرها.",
          "إرشادات الجوازات ووثائق السفر للمواطنين اللبنانيين.",
          "متابعة الحالات الخاصة ذات الطابع القنصلي العاجل.",
        ],
      },
    ],
    note: "قد تختلف المتطلبات النهائية حسب كل حالة. يُرجى تأكيد اللائحة الرسمية المحدثة مع السفارة قبل التقديم.",
  },
};

export default async function Services({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = text[locale];

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <header className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </header>

        <div className="quickGrid">
          {t.cards.map((card) => (
            <article className="card" key={card.title}>
              <h3>{card.title}</h3>
              <ul className="bulletList">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="noticeBox">{t.note}</div>
      </section>
    </SiteShell>
  );
}
