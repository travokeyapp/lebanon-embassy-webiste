import SiteShell from "@/components/site-shell";

const text = {
  en: {
    title: "Services",
    items: ["Visa Services", "Consular Services", "Citizen Services"],
  },
  ar: {
    title: "الخدمات",
    items: ["خدمات التأشيرات", "الخدمات القنصلية", "خدمات المواطنين"],
  },
};

export default async function Services({ params }: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await params;
  const t = text[locale] ?? text.en;

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <h2>{t.title}</h2>
        <div className="quickGrid">
          {t.items.map((item) => (
            <div className="card" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
