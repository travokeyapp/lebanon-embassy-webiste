import Image from "next/image";
import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

const content = {
  en: {
    title: "The Ambassador",
    subtitle: "Official profile and message from the Ambassador of Lebanon to Pakistan.",
    name: "H.E. Abdulaziz ISSA",
    role: "Ambassador Extraordinary and Plenipotentiary to the Islamic Republic of Pakistan",
    portraitAlt: "Official portrait of H.E. Abdulaziz ISSA",
    profileTitle: "Bio Data",
    profile: [
      "Name: H.E. Abdulaziz ISSA",
      "Mission: Embassy of the Republic of Lebanon in Islamabad",
      "Position: Ambassador of Lebanon to the Islamic Republic of Pakistan",
    ],
    messageTitle: "Message from the Ambassador",
    message: [
      "Dear Lebanese citizens and friends of Lebanon residing in Pakistan, welcome to the new website of the Embassy of Lebanon in Islamabad. It is an honor for me to represent my country, Lebanon, in lovely Pakistan, and to do my utmost to strengthen relations between our two countries for the benefit of our peoples.",
      "After a long absence from the internet, we are back to facilitate matters for stakeholders and to promote Lebanon primarily as a tourist destination and a promising land for investment.",
      "After the recent war between Israel and Hezbollah, the election of a new president for Lebanon in January 2025, and the formation of a new government, Lebanon has returned to its rightful place as a tourist destination offering everything a tourist needs for entertainment.",
      "We have received many visa applications, mostly from Pakistanis, and I encourage those who are still hesitant to travel to Lebanon to relax, discover, and enjoy our beautiful country.",
      "In this blessed month of Ramadan, I extend to you my warmest greetings and wish you acceptable and easy fasting. I pray that God grants us all lasting peace and prosperity.",
    ],
    signatureLead: "Sincerely,",
    signatureName: "Ambassador Abdulaziz ISSA",
  },
  ar: {
    title: "السفير",
    subtitle: "الملف الرسمي ورسالة سعادة سفير لبنان لدى باكستان.",
    name: "سعادة السفير عبد العزيز عيسى",
    role: "سفير فوق العادة ومفوض للجمهورية اللبنانية لدى جمهورية باكستان الإسلامية",
    portraitAlt: "الصورة الرسمية لسعادة السفير عبد العزيز عيسى",
    profileTitle: "السيرة المختصرة",
    profile: [
      "الاسم: سعادة السفير عبد العزيز عيسى",
      "البعثة: سفارة الجمهورية اللبنانية في إسلام آباد",
      "المنصب: سفير لبنان لدى جمهورية باكستان الإسلامية",
    ],
    messageTitle: "رسالة السفير",
    message: [
      "أعزائي المواطنين اللبنانيين وأصدقاء لبنان المقيمين في باكستان، أهلاً وسهلاً بكم في الموقع الإلكتروني الجديد لسفارة لبنان في إسلام آباد. إنه لشرف عظيم لي أن أمثل بلدي لبنان في باكستان الحبيبة، وأن أبذل قصارى جهدي لتعزيز العلاقات بين بلدينا لما فيه خير شعبينا.",
      "بعد غياب طويل عن الإنترنت، عدنا لتسهيل الأمور لأصحاب المصلحة وللترويج للبنان في المقام الأول كوجهة سياحية وأرض واعدة للاستثمار.",
      "بعد الحرب الأخيرة بين إسرائيل وحزب الله، وانتخاب رئيس جديد للبنان في يناير 2025 وتشكيل حكومة جديدة، عاد لبنان إلى مكانته الصحيحة كوجهة سياحية تقدم كل ما يحتاجه السائح للترفيه.",
      "لقد تلقينا العديد من طلبات التأشيرة، معظمها من باكستانيين، وأشجع أولئك الذين ما زالوا مترددين في السفر إلى لبنان على السفر لاكتشاف بلدنا الجميل والاستمتاع به.",
      "في هذا الشهر الفضيل، شهر رمضان المبارك، أتقدم إليكم بأحر التهاني وأتمنى لكم صياماً مقبولاً وسهلاً. أدعو الله أن يمنّ علينا جميعاً بالسلام والرخاء الدائمين.",
    ],
    signatureLead: "مع خالص التحيات،",
    signatureName: "السفير عبد العزيز عيسى",
  },
};

export default async function AmbassadorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];

  return (
    <SiteShell locale={locale} activeNav="ambassador">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.subtitle}</p>
        </div>

        <div className="contentSplit contentSplitWide ambassadorLayout">
          <aside className="card">
            <div className="ambassadorPortraitWrap">
              <Image
                src="/lebanon_ambasssador.jpeg"
                alt={t.portraitAlt}
                width={900}
                height={1200}
                className="ambassadorPortrait"
                priority
              />
            </div>
            <h3>{t.name}</h3>
            <p className="muted">{t.role}</p>
          </aside>

          <article className="card">
            <div className="ambassadorBioBlock">
              <h3 className="ambassadorSubheading">{t.profileTitle}</h3>
              <ul className="bulletList">
                {t.profile.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="ambassadorMessageBlock">
              <h3>{t.messageTitle}</h3>
              {t.message.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="ambassadorSignatureLead">{t.signatureLead}</p>
              <p className="ambassadorSignatureName">{t.signatureName}</p>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
