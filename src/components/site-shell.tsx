import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ResponsiveNav from "@/components/responsive-nav";
import ScrollEffects from "@/components/scroll-effects";
import UiModeToggle from "@/components/ui-mode-toggle";

type ActiveNav = "home" | "ambassador" | "consular" | "visas" | "relations" | "gallery" | "contact";

const copy = {
  en: {
    ribbon: "Official Website of the Embassy of the Republic of Lebanon in Islamabad - Pakistan",
    title: "Embassy of Lebanon",
    city: "Islamabad - Pakistan",
    arabicTop: "سفارة لبنان في إسلام أباد",
    arabicBottom: "باكستان",
    nav: {
      home: "Home",
      ambassador: "The Ambassador",
      consular: "Consular Services",
      visas: "Visas",
      relations: "Lebanon-Pakistan Relations",
      gallery: "Gallery",
      contact: "Contact Us",
    },
    footer: {
      contactTitle: "Contact Info",
      address: "House No. 4, Street No. 10, F-8/3 Islamabad, Pakistan",
      phone: "+92 51 227 8338",
      email: "lebanonembassypakistan@gmail.com",
      linksTitle: "Related Links",
      links: [
        { label: "Ministry of Foreign Affairs", href: "https://mfa.gov.lb/" },
        { label: "Invest in Lebanon", href: "https://investinlebanon.gov.lb/" },
        { label: "Ministry of Tourism", href: "https://mot.gov.lb/" },
      ],
      aboutTitle: "About",
      aboutText:
        "The Embassy of Lebanon in Pakistan is the sole diplomatic representation of the Lebanese Republic in Pakistan, dedicated to serving Lebanese citizens and fostering bilateral relations.",
      copyright: "Embassy of Lebanon in Islamabad. All Rights Reserved.",
    },
    menu: "Menu",
  },
  ar: {
    ribbon: "الموقع الرسمي لسفارة الجمهورية اللبنانية في إسلام أباد - باكستان",
    title: "سفارة لبنان",
    city: "إسلام أباد - باكستان",
    arabicTop: "سفارة لبنان في إسلام أباد",
    arabicBottom: "باكستان",
    nav: {
      home: "الرئيسية",
      ambassador: "السفير",
      consular: "الخدمات القنصلية",
      visas: "التأشيرات",
      relations: "العلاقات اللبنانية الباكستانية",
      gallery: "معرض الصور",
      contact: "اتصل بنا",
    },
    footer: {
      contactTitle: "معلومات التواصل",
      address: "المنزل رقم 4، الشارع رقم 10، F-8/3، إسلام أباد، باكستان",
      phone: "+92 51 227 8338",
      email: "lebanonembassypakistan@gmail.com",
      linksTitle: "روابط مهمة",
      links: [
        { label: "وزارة الخارجية", href: "https://mfa.gov.lb/" },
        { label: "استثمر في لبنان", href: "https://investinlebanon.gov.lb/" },
        { label: "وزارة السياحة", href: "https://mot.gov.lb/" },
      ],
      aboutTitle: "نبذة",
      aboutText:
        "سفارة لبنان في باكستان هي التمثيل الدبلوماسي الرسمي للجمهورية اللبنانية، وتعمل على خدمة المواطنين اللبنانيين وتعزيز العلاقات الثنائية.",
      copyright: "سفارة لبنان في إسلام أباد. جميع الحقوق محفوظة.",
    },
    menu: "القائمة",
  },
};

const agencyCopy = {
  en: {
    title: "Recommended Agency",
    text:
      "Crown International Travels Pvt. Ltd. is recommended by the Embassy of Lebanon in Islamabad for visa application processing, document attestation, tourism, and travel procedures for Lebanon.",
    logoAlt: "Crown International logo",
  },
  ar: {
    title: "\u0627\u0644\u0648\u0643\u0627\u0644\u0629 \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627",
    text:
      "\u062a\u0648\u0635\u064a \u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646 \u0641\u064a \u0625\u0633\u0644\u0627\u0645 \u0622\u0628\u0627\u062f \u0628\u0634\u0631\u0643\u0629 Crown International Travels Pvt. Ltd. \u0644\u062e\u062f\u0645\u0627\u062a \u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0627\u0644\u062a\u0623\u0634\u064a\u0631\u0627\u062a\u060c \u0648\u0627\u0644\u062a\u0635\u062f\u064a\u0642 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u060c \u0648\u0627\u0644\u0633\u064a\u0627\u062d\u0629\u060c \u0648\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0627\u0644\u0633\u0641\u0631 \u0625\u0644\u0649 \u0644\u0628\u0646\u0627\u0646.",
    logoAlt: "\u0634\u0639\u0627\u0631 Crown International",
  },
} as const;

export default function SiteShell({
  locale,
  activeNav,
  children,
}: {
  locale: "en" | "ar";
  activeNav?: ActiveNav;
  children: ReactNode;
}) {
  const t = copy[locale];
  const agency = agencyCopy[locale];
  const isArabic = locale === "ar";
  const navItems: Array<{ key: ActiveNav; href: string; label: string }> = [
    { key: "home", href: `/${locale}`, label: t.nav.home },
    { key: "ambassador", href: `/${locale}/ambassador`, label: t.nav.ambassador },
    { key: "consular", href: `/${locale}/consular`, label: t.nav.consular },
    { key: "visas", href: `/${locale}/visas`, label: t.nav.visas },
    { key: "relations", href: `/${locale}/relations`, label: t.nav.relations },
    { key: "contact", href: `/${locale}/contact`, label: t.nav.contact },
  ];

  return (
    <main className={`sitePage${isArabic ? " rtl" : ""}`}>
      <ScrollEffects />
      <div className="topRibbon">
        <div className="container ribbonRow">
          <span>{t.ribbon}</span>
          <div className="ribbonControls">
            <div className="langInline" aria-label="Language switcher">
              <Link href="/en" className={locale === "en" ? "active" : ""}>
                English
              </Link>
              <span>|</span>
              <Link href="/ar" className={locale === "ar" ? "active" : ""}>
                العربية
              </Link>
            </div>
            <UiModeToggle locale={locale} />
          </div>
        </div>
      </div>

      <header className="siteHeader">
        <div className="container headerRow">
          <div className="brandWrap">
            <Image
              src="/cedar-logo.png"
              alt="Cedar Logo"
              width={80}
              height={65}
              className="cedarLogo"
              priority
              suppressHydrationWarning
            />
            <div className="brand">
              <h1>{t.title}</h1>
              <p>{t.city}</p>
            </div>
          </div>
        </div>

        <nav className="nav">
          <ResponsiveNav navItems={navItems} activeNav={activeNav} menuLabel={t.menu} />
        </nav>
      </header>

      <div className="siteContent">{children}</div>

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
              {t.footer.links.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="footerCard">
            <h4>{t.footer.aboutTitle}</h4>
            <p>{t.footer.aboutText}</p>
          </section>

          <section className="footerCard">
            <h4>{agency.title}</h4>
            <p>{agency.text}</p>
            <div className="footerAgencyMark">
              <Image
                src="/crown-international-logo.svg"
                alt={agency.logoAlt}
                width={190}
                height={190}
                className="footerAgencyLogo"
              />
            </div>
          </section>
        </div>

        <div className="container footerBottom">(c) {new Date().getFullYear()} {t.footer.copyright}</div>
      </footer>
    </main>
  );
}
