import SiteShell from "@/components/site-shell";
import Link from "next/link";
import { normalizeLocale } from "@/lib/locale";

const content = {
  en: {
    title: "Lebanon-Pakistan Relations",
    intro:
      "Lebanon and Pakistan maintain friendly bilateral relations anchored in formal treaties, diplomatic engagement, and practical cooperation across multiple sectors.",
    sections: [
      {
        title: "Historical and Diplomatic Framework",
        paragraphs: [
          "A Treaty of Friendship between Lebanon and Pakistan was signed in Beirut on January 16, 1953 and entered into force on August 18, 1954.",
          "According to Pakistan's Ministry of Foreign Affairs, bilateral ties were established in the 1950s and continue through resident embassies in Islamabad and Beirut.",
          "Both sides signed an MoU on Bilateral Consultations in 2002, and the first round of consultations was held in Beirut on November 28, 2018.",
        ],
      },
      {
        title: "Economic and Technical Cooperation",
        paragraphs: [
          "Pakistan and Lebanon signed an agreement to establish a Joint Economic Commission (JEC) on July 28, 2022.",
          "The agreement entered into force on May 17, 2023, creating a formal mechanism to expand bilateral economic cooperation.",
        ],
        bullets: [
          "Pakistan MOFA reports bilateral trade at approximately USD 10.61 million for 2022-2023.",
          "Priority areas include trade facilitation, private-sector engagement, and technical coordination.",
          "Both countries continue to use diplomatic channels to identify new commercial opportunities.",
        ],
      },
      {
        title: "Multilateral and Regional Engagement",
        paragraphs: [
          "Lebanon and Pakistan cooperate in multilateral settings, including the United Nations and the Organization of Islamic Cooperation (OIC).",
          "The relationship continues to focus on dialogue, sovereignty, and support for regional stability.",
        ],
      },
      {
        title: "Current Direction",
        paragraphs: [
          "As of February 19, 2026, publicly available government information reflects ongoing diplomatic engagement and gradual economic cooperation.",
          "For current consular instructions, citizens and applicants should rely on direct embassy communication.",
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
      { label: "Consular Affairs", href: "/consular" },
      { label: "Contact the Embassy", href: "/contact" },
    ],
    footnote:
      "Data points on this page are based on publicly available entries from Pakistan MOFA and the UN Treaty Collection; operational requirements should always be confirmed with the Embassy.",
  },
  ar: {
    title: "العلاقات اللبنانية - الباكستانية",
    intro:
      "تحافظ لبنان وباكستان على علاقات ثنائية ودية ترتكز على اتفاقات رسمية وتواصل دبلوماسي وتعاون عملي في عدة مجالات.",
    sections: [
      {
        title: "الإطار التاريخي والدبلوماسي",
        paragraphs: [
          "تم توقيع معاهدة الصداقة بين لبنان وباكستان في بيروت بتاريخ 16 يناير 1953، ودخلت حيّز التنفيذ في 18 أغسطس 1954.",
          "وبحسب وزارة الخارجية الباكستانية، تعود العلاقات الثنائية إلى خمسينيات القرن الماضي مع وجود سفارتين مقيمتين في إسلام آباد وبيروت.",
          "كما وقّع الجانبان مذكرة تفاهم للمشاورات الثنائية عام 2002، وعُقدت الجولة الأولى من المشاورات في بيروت بتاريخ 28 نوفمبر 2018.",
        ],
      },
      {
        title: "التعاون الاقتصادي والتقني",
        paragraphs: [
          "وقّع لبنان وباكستان اتفاق إنشاء اللجنة الاقتصادية المشتركة بتاريخ 28 يوليو 2022.",
          "ودخل الاتفاق حيّز التنفيذ في 17 مايو 2023، ما أتاح إطارًا مؤسسيًا لتوسيع التعاون الاقتصادي.",
        ],
        bullets: [
          "تفيد وزارة الخارجية الباكستانية بأن حجم التبادل التجاري بلغ نحو 10.61 مليون دولار أمريكي خلال 2022-2023.",
          "تشمل الأولويات تسهيل التجارة، وتفعيل دور القطاع الخاص، وتعزيز التنسيق الفني.",
          "يواصل البلدان استخدام القنوات الدبلوماسية لاستكشاف فرص تجارية جديدة.",
        ],
      },
      {
        title: "التعاون متعدد الأطراف والإقليمي",
        paragraphs: [
          "يتعاون لبنان وباكستان ضمن الأطر متعددة الأطراف، بما فيها الأمم المتحدة ومنظمة التعاون الإسلامي.",
          "ويستمر التركيز على الحوار واحترام السيادة ودعم الاستقرار الإقليمي.",
        ],
      },
      {
        title: "الاتجاه الحالي",
        paragraphs: [
          "حتى تاريخ 19 فبراير 2026، تُظهر البيانات الحكومية المتاحة استمرار التواصل الدبلوماسي وتقدمًا تدريجيًا في التعاون الاقتصادي.",
          "وللحصول على التعليمات القنصلية الأحدث، ينبغي الاعتماد على التواصل المباشر مع السفارة.",
        ],
      },
    ],
    headOfMissionTitle: "رئيس البعثة",
    headName: "سعادة السيد عبدالعزيز عيسى",
    headRole: "سفير لبنان لدى باكستان",
    viewBiography: "عرض السيرة الذاتية",
    quickLinksTitle: "روابط سريعة",
    quickLinks: [
      { label: "متطلبات التأشيرة", href: "/visas" },
      { label: "الشؤون القنصلية", href: "/consular" },
      { label: "التواصل مع السفارة", href: "/contact" },
    ],
    footnote:
      "تعتمد المعلومات الواردة في هذه الصفحة على بيانات منشورة من وزارة الخارجية الباكستانية وسجل معاهدات الأمم المتحدة، ويجب تأكيد المتطلبات التشغيلية مباشرة مع السفارة.",
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
