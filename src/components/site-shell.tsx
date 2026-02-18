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
    footer: "Embassy of Lebanon. All rights reserved.",
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
    footer: "سفارة لبنان. جميع الحقوق محفوظة.",
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

      <footer>
        <div className="container">© {new Date().getFullYear()} {t.footer}</div>
      </footer>
    </main>
  );
}
