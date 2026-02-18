import SiteShell from "@/components/site-shell";

const text = {
  en: {
    title: "About the Embassy",
    body: "This section will include the Ambassador's message and mission statement in English and Arabic.",
  },
  ar: {
    title: "عن السفارة",
    body: "يتضمن هذا القسم رسالة السفير ورؤية السفارة باللغتين العربية والإنجليزية.",
  },
};

export default async function About({ params }: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await params;
  const t = text[locale] ?? text.en;

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <h2>{t.title}</h2>
        <p>{t.body}</p>
      </section>
    </SiteShell>
  );
}
