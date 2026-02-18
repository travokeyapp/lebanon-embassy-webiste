import SiteShell from "@/components/site-shell";

const content = {
  en: {
    heroTitle: "Welcome to the Embassy of Lebanon",
    heroText: "Strengthening the diplomatic, cultural, and economic ties between the Lebanese Republic and the Islamic Republic of Pakistan.",
    sectionTitle: "Latest News & Events",
    headOfMission: "Head of Mission",
    placeholder: "[Photo of Ambassador]",
    news: [
      {
        month: "JAN",
        day: "15",
        title: "Ambassador Issa meets with Federal Minister of Commerce",
        excerpt:
          "H.E. Mr. Abdulaziz Issa discussed enhancing bilateral trade volume and economic cooperation between Lebanon and Pakistan during a meeting at the Ministry of Commerce.",
      },
      {
        month: "DEC",
        day: "08",
        title: "Embassy celebrates Lebanese Independence Day",
        excerpt:
          "A ceremony was held at the Embassy with officials, diplomatic representatives, and members of the Lebanese community in Pakistan.",
      },
    ],
  },
  ar: {
    heroTitle: "مرحبًا بكم في سفارة لبنان",
    heroText: "تعزيز الروابط الدبلوماسية والثقافية والاقتصادية بين الجمهورية اللبنانية وجمهورية باكستان الإسلامية.",
    sectionTitle: "آخر الأخبار والفعاليات",
    headOfMission: "رئيس البعثة",
    placeholder: "[صورة السفير]",
    news: [
      {
        month: "يناير",
        day: "15",
        title: "لقاء السفير عيسى مع وزير التجارة الفيدرالي",
        excerpt: "بحث سعادة السفير عبدالعزيز عيسى تعزيز التبادل التجاري والتعاون الاقتصادي بين لبنان وباكستان.",
      },
      {
        month: "ديسمبر",
        day: "08",
        title: "احتفال السفارة بعيد الاستقلال اللبناني",
        excerpt: "أقيمت مراسم في السفارة بحضور مسؤولين ودبلوماسيين وأبناء الجالية اللبنانية في باكستان.",
      },
    ],
  },
};

export default async function Home({ params }: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await params;
  const t = content[locale] ?? content.en;

  return (
    <SiteShell locale={locale} activeNav="home">
      <section className="heroBlock">
        <div className="welcomePanel">
          <h2>{t.heroTitle}</h2>
          <p>{t.heroText}</p>
        </div>
      </section>

      <section className="newsSection">
        <div className="container newsGrid">
          <div>
            <h3 className="newsHeading">{t.sectionTitle}</h3>
            <div className="newsList">
              {t.news.map((item) => (
                <article className="newsItem" key={`${item.month}-${item.day}-${item.title}`}>
                  <div className="dateBox">
                    <span>{item.month}</span>
                    <strong>{item.day}</strong>
                  </div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="missionCard">
            <h4>{t.headOfMission}</h4>
            <div className="missionPlaceholder">{t.placeholder}</div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
