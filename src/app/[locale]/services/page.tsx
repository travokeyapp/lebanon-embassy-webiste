import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

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

export default async function Services({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = text[locale];

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
