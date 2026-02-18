import Image from "next/image";
import Link from "next/link";

const copy = {
  en: {
    ribbon: "Official Website of the Embassy of the Republic of Lebanon in Islamabad - Pakistan",
    title: "Embassy of Lebanon",
    city: "Islamabad - Pakistan",
    arabicTop: "سفارة لبنان في إسلام آباد",
    arabicBottom: "الجمهورية اللبنانية",
    nav: {
      home: "Home",
      ambassador: "The Ambassador",
      consular: "Consular Services",
      visas: "Visas",
      relations: "Lebanon-Pakistan Relations",
      contact: "Contact Us",
    },
    footer: {
      contactTitle: "Contact Info",
      address: "House No. 4, Street No. 10, F-8/3 Islamabad, Pakistan",
      phone: "+92 51 227 8338",
      email: "lebanonembassypakistan@gmail.com",
      linksTitle: "Related Links",
      links: ["Ministry of Foreign Affairs", "Invest in Lebanon", "Ministry of Tourism"],
      aboutTitle: "About",
      aboutText:
        "The Embassy of Lebanon in Pakistan is the sole diplomatic representation of the Lebanese Republic in Pakistan, dedicated to serving Lebanese citizens and fostering bilateral relations.",
      copyright: "Embassy of Lebanon in Islamabad. All Rights Reserved.",
    },
    menu: "Menu",
  },
  ar: {
    ribbon: "الموقع الرسمي لسفارة الجمهورية اللبنانية في إسلام آباد - باكستان",
    title: "سفارة لبنان",
    city: "إسلام آباد - باكستان",
    arabicTop: "سفارة لبنان في إسلام آباد",
    arabicBottom: "الجمهورية اللبنانية",
    nav: {
      home: "الرئيسية",
      ambassador: "السفير",
      consular: "الخدمات القنصلية",
      visas: "التأشيرات",
      relations: "العلاقات اللبنانية الباكستانية",
      contact: "اتصل بنا",
    },
    footer: {
      contactTitle: "معلومات التواصل",
      address: "المنزل رقم 4، الشارع رقم 10، F-8/3، إسلام آباد، باكستان",
      phone: "+92 51 227 8338",
      email: "lebanonembassypakistan@gmail.com",
      linksTitle: "روابط مهمة",
      links: ["وزارة الخارجية", "استثمر في لبنان", "وزارة السياحة"],
      aboutTitle: "نبذة",
      aboutText:
        "سفارة لبنان في باكستان هي التمثيل الدبلوماسي الرسمي للجمهورية اللبنانية، وتعمل على خدمة المواطنين اللبنانيين وتعزيز العلاقات الثنائية.",
      copyright: "سفارة لبنان في إسلام آباد. جميع الحقوق محفوظة.",
    },
    menu: "القائمة",
  },
};

export default function SiteShell({
  locale,
  children,
}: {
  locale: "en" | "ar";
  children: React.ReactNode;
}) {
  const t = copy[locale];
  const isArabic = locale === "ar";

  return (
    <main className={isArabic ? "rtl" : ""}>
      <div className="topRibbon">
        <div className="container ribbonRow">
          <span>{t.ribbon}</span>
          <div className="langInline" aria-label="Language switcher">
            <Link href="/en" className={locale === "en" ? "active" : ""}>
              English
            </Link>
            <span>|</span>
            <Link href="/ar" className={locale === "ar" ? "active" : ""}>
              العربية
            </Link>
          </div>
        </div>
      </div>

      <header className="siteHeader">
        <div className="container headerRow">
          <div className="brandWrap">
            <Image src="/cedar-logo.svg" alt="Cedar Logo" width={56} height={70} className="cedarLogo" priority />
            <div className="brand">
              <h1>{t.title}</h1>
              <p>{t.city}</p>
            </div>
          </div>

          <div className="arabicHeader">
            <p>{t.arabicTop}</p>
            <span>{t.arabicBottom}</span>
          </div>
        </div>

        <nav className="nav">
          <div className="container navRow">
            <input id="menu-toggle" className="menuToggleInput" type="checkbox" />
            <label htmlFor="menu-toggle" className="menuToggleBtn" aria-label={t.menu}>
              ☰ {t.menu}
            </label>

            <ul className="navLinks">
              <li>
                <Link href={`/${locale}`}>{t.nav.home}</Link>
              </li>
              <li>
                <Link href={`/${locale}/about`}>{t.nav.ambassador}</Link>
              </li>
              <li>
                <Link href={`/${locale}/services`}>{t.nav.consular}</Link>
              </li>
              <li>
                <Link href={`/${locale}/services`}>{t.nav.visas}</Link>
              </li>
              <li>
                <Link href={`/${locale}/about`}>{t.nav.relations}</Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`}>{t.nav.contact}</Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {children}

      <footer className="siteFooter">
        <div className="container footerColumns">
          <section className="footerCard">
            <h4>{t.footer.contactTitle}</h4>
            <p>{t.footer.address}</p>
            <p>
              <strong>Phone:</strong> {t.footer.phone}
            </p>
            <p>
              <strong>Email:</strong> {t.footer.email}
            </p>
          </section>

          <section className="footerCard">
            <h4>{t.footer.linksTitle}</h4>
            <ul className="footerLinks">
              {t.footer.links.map((label) => (
                <li key={label}>
                  <a href="#">{label}</a>
                </li>
              ))}
            </ul>
          </section>

          <section className="footerCard">
            <h4>{t.footer.aboutTitle}</h4>
            <p>{t.footer.aboutText}</p>
          </section>
        </div>

        <div className="container footerBottom">© {new Date().getFullYear()} {t.footer.copyright}</div>
      </footer>
    </main>
  );
}
