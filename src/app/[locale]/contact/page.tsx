import SiteShell from "@/components/site-shell";

const text = {
  en: {
    title: "Contact",
    address: "House No. 4, Street No. 10, F-8/3, Islamabad, Pakistan",
    phone: "051-2278338",
    email: "lebanonembassypakistan@gmail.com",
  },
  ar: {
    title: "اتصل بنا",
    address: "المنزل رقم 4، الشارع رقم 10، F-8/3، إسلام آباد، باكستان",
    phone: "051-2278338",
    email: "lebanonembassypakistan@gmail.com",
  },
};

export default async function Contact({ params }: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await params;
  const t = text[locale] ?? text.en;

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <h2>{t.title}</h2>
        <div className="card">
          <p>
            <strong>Address:</strong> {t.address}
          </p>
          <p>
            <strong>Phone:</strong> {t.phone}
          </p>
          <p>
            <strong>Email:</strong> {t.email}
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
