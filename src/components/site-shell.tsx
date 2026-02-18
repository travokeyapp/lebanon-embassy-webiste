import Link from "next/link";

const copy = {
  en: {
    official: "Official Website of the Embassy of the Republic of Lebanon",
    city: "Islamabad - Pakistan",
    home: "Home",
    about: "About",
    services: "Services",
    contact: "Contact",
    footer: "Embassy of Lebanon. All rights reserved.",
  },
  ar: {
    official: "الموقع الرسمي لسفارة الجمهورية اللبنانية",
    city: "إسلام آباد - باكستان",
    home: "الرئيسية",
    about: "عن السفارة",
    services: "الخدمات",
    contact: "اتصل بنا",
    footer: "سفارة لبنان. جميع الحقوق محفوظة.",
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
        <div className="container">{t.official}</div>
      </div>

      <header className="siteHeader">
        <div className="container headerRow">
          <div className="brand">
            <h1>Embassy of Lebanon</h1>
            <p>{t.city}</p>
          </div>

          <div className="langSwitcher" aria-label="Language switcher">
            <Link className={`langBtn ${locale === "en" ? "active" : ""}`} href="/en">
              EN
            </Link>
            <Link className={`langBtn ${locale === "ar" ? "active" : ""}`} href="/ar">
              AR
            </Link>
          </div>
        </div>

        <nav className="nav">
          <div className="container">
            <ul>
              <li>
                <Link href={`/${locale}`}>{t.home}</Link>
              </li>
              <li>
                <Link href={`/${locale}/about`}>{t.about}</Link>
              </li>
              <li>
                <Link href={`/${locale}/services`}>{t.services}</Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`}>{t.contact}</Link>
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
