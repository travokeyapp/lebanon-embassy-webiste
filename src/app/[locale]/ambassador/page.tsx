import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

const content = {
  en: {
    title: "The Ambassador",
    subtitle: "Embassy leadership and diplomatic priorities in Pakistan.",
    name: "H.E. Abdulaziz ISSA",
    role: "Ambassador Extraordinary and Plenipotentiary to the Islamic Republic of Pakistan",
    portraitLabel: "Official Portrait",
    message: [
      "The Embassy of Lebanon in Islamabad works to protect Lebanese nationals, deepen bilateral cooperation, and promote constructive engagement between Lebanon and Pakistan.",
      "Under the direction of the Ambassador, the mission continues to prioritize citizen services, institutional dialogue, and practical economic collaboration.",
    ],
    prioritiesTitle: "Current Diplomatic Priorities",
    priorities: [
      "Strengthening political dialogue and high-level exchanges.",
      "Expanding trade and technical cooperation frameworks.",
      "Improving access to consular and civil-status services for Lebanese citizens.",
      "Supporting cultural and educational partnerships between both countries.",
    ],
  },
  ar: {
    title: "السفير",
    subtitle: "قيادة البعثة الدبلوماسية وأولويات العمل في باكستان.",
    name: "سعادة السيد عبد العزيز عيسى",
    role: "سفير فوق العادة ومفوض للجمهورية اللبنانية لدى جمهورية باكستان الإسلامية",
    portraitLabel: "الصورة الرسمية",
    message: [
      "تعمل سفارة لبنان في إسلام آباد على خدمة المواطنين اللبنانيين وتعزيز التعاون الثنائي وترسيخ التواصل الإيجابي بين لبنان وباكستان.",
      "وبتوجيه من سعادة السفير، تواصل البعثة التركيز على الخدمات القنصلية، والحوار المؤسسي، والتعاون الاقتصادي العملي.",
    ],
    prioritiesTitle: "الأولويات الدبلوماسية الحالية",
    priorities: [
      "تعزيز الحوار السياسي والزيارات رفيعة المستوى.",
      "توسيع أطر التعاون التجاري والتقني.",
      "تسهيل الخدمات القنصلية ومعاملات الأحوال الشخصية للبنانيين.",
      "دعم الشراكات الثقافية والتعليمية بين البلدين.",
    ],
  },
};

export default async function AmbassadorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];

  return (
    <SiteShell locale={locale} activeNav="ambassador">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.subtitle}</p>
        </div>

        <div className="contentSplit contentSplitWide">
          <aside className="card">
            <div className="placeholderPortrait">{t.portraitLabel}</div>
            <h3>{t.name}</h3>
            <p className="muted">{t.role}</p>
          </aside>

          <article className="card">
            {t.message.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <h3>{t.prioritiesTitle}</h3>
            <ul className="bulletList">
              {t.priorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
