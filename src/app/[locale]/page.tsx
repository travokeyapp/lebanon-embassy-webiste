import SiteShell from "@/components/site-shell";

const content = {
  en: {
    title: "Welcome to the Embassy of Lebanon",
    subtitle: "Fast-track Phase 1 Next.js implementation",
    officeHours: "Office Hours: Mon-Thu 09:00-15:00, Fri 09:00-13:00",
    cards: ["Visa Services", "Consular Services", "News & Announcements", "Downloads & Forms"],
  },
  ar: {
    title: "مرحبًا بكم في سفارة لبنان",
    subtitle: "تنفيذ المرحلة الأولى باستخدام Next.js",
    officeHours: "ساعات العمل: الإثنين-الخميس 09:00-15:00، الجمعة 09:00-13:00",
    cards: ["خدمات التأشيرات", "الخدمات القنصلية", "الأخبار والإعلانات", "النماذج والتحميلات"],
  },
};

export default async function Home({ params }: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await params;
  const t = content[locale] ?? content.en;

  return (
    <SiteShell locale={locale}>
      <section className="hero">
        <div className="container">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
          <strong>{t.officeHours}</strong>
          <div className="quickGrid">
            {t.cards.map((card) => (
              <div key={card} className="card">
                {card}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
