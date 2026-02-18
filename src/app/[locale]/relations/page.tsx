import SiteShell from "@/components/site-shell";
import Link from "next/link";
import { normalizeLocale } from "@/lib/locale";

const content = {
  en: {
    title: "Lebanon-Pakistan Relations",
    intro:
      "Relations between Lebanon and Pakistan are rooted in a long-standing Treaty of Friendship and a shared commitment to dialogue, sovereignty, and regional stability.",
    sections: [
      {
        title: "Historical and Diplomatic Foundations",
        paragraphs: [
          "Diplomatic ties were formalized in the early 1950s, including the Treaty of Friendship signed in Beirut on January 16, 1953.",
          "Both countries maintain resident embassies and continue regular diplomatic engagement through bilateral and multilateral forums.",
        ],
      },
      {
        title: "Economic and Technical Cooperation",
        paragraphs: [
          "Lebanon and Pakistan continue to expand cooperation in trade, investment, agriculture, and technical exchange.",
        ],
        bullets: [
          "Joint Economic Commission mechanisms support structured cooperation.",
          "Priority sectors include textiles, agricultural products, and selected industrial goods.",
          "Both sides continue encouraging private-sector partnerships.",
        ],
      },
      {
        title: "Humanitarian and Security Cooperation",
        paragraphs: [
          "Pakistan has repeatedly extended humanitarian support to Lebanon in periods of crisis.",
          "Security dialogue and institutional coordination remain part of broader bilateral cooperation.",
        ],
      },
      {
        title: "Current Landscape",
        paragraphs: [
          "As of 2026, bilateral relations remain focused on practical cooperation, diplomatic coordination, and support for stability.",
          "For the latest consular guidance and official requirements, please contact the Embassy directly.",
        ],
      },
    ],
    headOfMissionTitle: "Head of Mission",
    headName: "H.E. Mr. Abdulaziz Issa",
    headRole: "Ambassador of Lebanon to Pakistan",
    viewBiography: "View Biography",
    quickLinksTitle: "Quick Links",
    quickLinks: [
      { label: "Visa Requirements", href: "/visas" },
      { label: "Trade and Technical Cooperation", href: "/relations" },
      { label: "Consular Affairs", href: "/consular" },
    ],
    footnote: "For official updates, policy notices, and current requirements, please contact the Embassy directly.",
  },
  ar: {
    title: "العلاقات اللبنانية - الباكستانية",
    intro:
      "ترتكز العلاقات بين لبنان وباكستان على معاهدة صداقة تاريخية وعلى التزام مشترك بالحوار واحترام السيادة والاستقرار الإقليمي.",
    sections: [
      {
        title: "الأسس التاريخية والدبلوماسية",
        paragraphs: [
          "تأسست العلاقات الدبلوماسية رسميًا في مطلع خمسينيات القرن الماضي، ومن أبرز محطاتها معاهدة الصداقة الموقعة في بيروت بتاريخ 16 يناير 1953.",
          "يحافظ البلدان على سفارتين مقيمتين وتواصل دبلوماسي منتظم على المستويين الثنائي ومتعدد الأطراف.",
        ],
      },
      {
        title: "التعاون الاقتصادي والتقني",
        paragraphs: [
          "يواصل لبنان وباكستان تطوير مجالات التعاون في التجارة والاستثمار والزراعة والتبادل التقني.",
        ],
        bullets: [
          "تسهم آليات اللجنة الاقتصادية المشتركة في تنظيم التعاون.",
          "تشمل القطاعات ذات الأولوية المنسوجات والمنتجات الزراعية وبعض السلع الصناعية.",
          "يستمر الجانبان في دعم الشراكات بين القطاع الخاص في البلدين.",
        ],
      },
      {
        title: "التعاون الإنساني والأمني",
        paragraphs: [
          "قدمت باكستان دعمًا إنسانيًا للبنان في فترات الأزمات، بما يعكس متانة العلاقات الثنائية.",
          "كما يشكل التنسيق المؤسسي والحوار الأمني جزءًا من مسار التعاون بين البلدين.",
        ],
      },
      {
        title: "المشهد الحالي",
        paragraphs: [
          "حتى عام 2026، يركز التعاون الثنائي على العمل العملي والتنسيق الدبلوماسي ودعم الاستقرار.",
          "للحصول على أحدث المعلومات القنصلية والمتطلبات الرسمية، يرجى التواصل مع السفارة مباشرة.",
        ],
      },
    ],
    headOfMissionTitle: "رئيس البعثة",
    headName: "سعادة السيد عبد العزيز عيسى",
    headRole: "سفير لبنان لدى باكستان",
    viewBiography: "عرض السيرة الذاتية",
    quickLinksTitle: "روابط سريعة",
    quickLinks: [
      { label: "متطلبات التأشيرة", href: "/visas" },
      { label: "التعاون التجاري والتقني", href: "/relations" },
      { label: "الشؤون القنصلية", href: "/consular" },
    ],
    footnote: "للحصول على التحديثات الرسمية والاشتراطات الحالية، يرجى التواصل مباشرة مع السفارة.",
  },
};

export default async function RelationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];

  return (
    <SiteShell locale={locale} activeNav="relations">
      <section className="section container">
        <div className="relationsLayout">
          <article className="relationsMain">
            <h2 className="relationsTitle">{t.title}</h2>
            <p className="relationsIntro">{t.intro}</p>

            {t.sections.map((section) => (
              <section className="relationsSection" key={section.title}>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="relationsBullets">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="relationsHighlight">{t.footnote}</div>
          </article>

          <aside className="relationsSidebar">
            <section className="relationsSideCard">
              <h3 className="relationsSideTitle">{t.headOfMissionTitle}</h3>
              <p className="relationsMissionName">{t.headName}</p>
              <p className="relationsMissionRole">{t.headRole}</p>
              <Link className="relationsBioButton" href={`/${locale}/ambassador`}>
                {t.viewBiography}
              </Link>
            </section>

            <section className="relationsSideCard">
              <h3 className="relationsSideTitle">{t.quickLinksTitle}</h3>
              <ul className="relationsQuickLinks">
                {t.quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={`/${locale}${item.href}`}>{item.label}</Link>
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
