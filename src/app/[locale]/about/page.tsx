import SiteShell from "@/components/site-shell";

const text = {
  en: {
    title: "About the Embassy",
    lead: "The Embassy of the Republic of Lebanon in Islamabad is Lebanon's official diplomatic mission in Pakistan.",
    missionTitle: "Mission",
    mission: [
      "Protect the interests of Lebanon and support Lebanese citizens in Pakistan through consular and administrative services.",
      "Advance bilateral cooperation in political dialogue, trade, education, and cultural exchange.",
      "Coordinate with Lebanese and Pakistani institutions to support stable and practical state-to-state engagement.",
    ],
    milestonesTitle: "Key Bilateral Milestones",
    milestones: [
      "Treaty of Friendship signed in Beirut on January 16, 1953 (UN Treaty Series No. 4137).",
      "Treaty entered into force on August 18, 1954 following ratification.",
      "Pakistan and Lebanon signed an MoU on Bilateral Consultations in 2002; the first session was held in Beirut on November 28, 2018.",
      "An agreement establishing a Joint Economic Commission (JEC) was signed on July 28, 2022 and entered into force on May 17, 2023.",
    ],
    servicesTitle: "Public and Consular Focus",
    services: [
      "Visa and entry guidance for travel to Lebanon.",
      "Document legalization and attestation support.",
      "Civil-status and passport-related consular assistance.",
    ],
    note: "Ambassador biography and portrait will be updated when official materials are provided by the Embassy.",
  },
  ar: {
    title: "عن السفارة",
    lead: "سفارة الجمهورية اللبنانية في إسلام أباد هي البعثة الدبلوماسية الرسمية للبنان لدى باكستان.",
    missionTitle: "المهمة",
    mission: [
      "حماية مصالح لبنان وخدمة المواطنين اللبنانيين في باكستان عبر الخدمات القنصلية والإدارية.",
      "تعزيز التعاون الثنائي في الحوار السياسي والتجارة والتعليم والتبادل الثقافي.",
      "التنسيق مع المؤسسات اللبنانية والباكستانية لدعم تعاون عملي ومستقر بين البلدين.",
    ],
    milestonesTitle: "محطات أساسية في العلاقات الثنائية",
    milestones: [
      "توقيع معاهدة الصداقة في بيروت بتاريخ 16 يناير 1953 (سلسلة معاهدات الأمم المتحدة رقم 4137).",
      "دخلت المعاهدة حيّز التنفيذ في 18 أغسطس 1954 بعد استكمال إجراءات التصديق.",
      "وقّع لبنان وباكستان مذكرة تفاهم للمشاورات الثنائية عام 2002، وعُقدت الجلسة الأولى في بيروت بتاريخ 28 نوفمبر 2018.",
      "تم توقيع اتفاق إنشاء اللجنة الاقتصادية المشتركة بتاريخ 28 يوليو 2022، ودخل حيّز التنفيذ في 17 مايو 2023.",
    ],
    servicesTitle: "التركيز القنصلي والخدماتي",
    services: [
      "إرشادات التأشيرات والدخول إلى لبنان.",
      "خدمات التصديق والمعاملات القنصلية.",
      "المساعدة في معاملات الأحوال الشخصية والجوازات.",
    ],
    note: "سيتم تحديث السيرة الذاتية للسفير والصورة الرسمية فور تزويدنا بالمواد المعتمدة من السفارة.",
  },
};

export default async function About({ params }: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await params;
  const t = text[locale] ?? text.en;

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <header className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </header>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.missionTitle}</h3>
            <ul className="bulletList">
              {t.mission.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>{t.servicesTitle}</h3>
            <ul className="bulletList">
              {t.services.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <article className="card stack">
          <h3>{t.milestonesTitle}</h3>
          <ul className="bulletList">
            {t.milestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <div className="noticeBox">{t.note}</div>
      </section>
    </SiteShell>
  );
}
