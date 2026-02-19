import SiteShell from "@/components/site-shell";

const text = {
  en: {
    title: "Contact Us",
    getInTouch: "Get in Touch",
    addressLabel: "Address",
    address: "House No. 4, Street No. 10, F-8/3, Islamabad, Pakistan",
    phoneLabel: "Phone Numbers",
    phones: ["051-2278338", "051-2278565"],
    faxLabel: "Fax Number",
    fax: "051-2826410",
    emailLabel: "Email Address",
    email: "lebanonembassypakistan@gmail.com",
    officeHoursLabel: "Office Hours",
    officeHours: ["Monday - Thursday: 09:00 AM - 03:00 PM", "Friday: 09:00 AM - 01:00 PM"],
    inquiryTitle: "Send an Inquiry",
    inquiryIntro:
      "For consular or general inquiries, please fill out the form below and we will get back to you as soon as possible.",
    fullName: "Full Name",
    emailAddress: "Email Address",
    subject: "Subject",
    message: "Message",
    namePlaceholder: "Your Name",
    emailPlaceholder: "Your Email",
    subjectPlaceholder: "Topic of Inquiry",
    messagePlaceholder: "How can we help you?",
    sendMessage: "Send Message",
    mapTitle: "Embassy Location",
    mapFrameTitle: "Embassy location map",
  },
  ar: {
    title: "اتصل بنا",
    getInTouch: "ابقَ على تواصل",
    addressLabel: "العنوان",
    address: "المنزل رقم 4، الشارع رقم 10، F-8/3، إسلام آباد، باكستان",
    phoneLabel: "أرقام الهاتف",
    phones: ["051-2278338", "051-2278565"],
    faxLabel: "رقم الفاكس",
    fax: "051-2826410",
    emailLabel: "البريد الإلكتروني",
    email: "lebanonembassypakistan@gmail.com",
    officeHoursLabel: "ساعات العمل",
    officeHours: ["الاثنين - الخميس: 09:00 ص - 03:00 م", "الجمعة: 09:00 ص - 01:00 م"],
    inquiryTitle: "أرسل استفسارًا",
    inquiryIntro:
      "للاستفسارات القنصلية أو العامة، يرجى تعبئة النموذج أدناه وسنعاود التواصل معك في أقرب وقت ممكن.",
    fullName: "الاسم الكامل",
    emailAddress: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    namePlaceholder: "اسمك",
    emailPlaceholder: "بريدك الإلكتروني",
    subjectPlaceholder: "موضوع الاستفسار",
    messagePlaceholder: "كيف يمكننا مساعدتك؟",
    sendMessage: "إرسال الرسالة",
    mapTitle: "موقع السفارة",
    mapFrameTitle: "خريطة موقع السفارة",
  },
};

export default async function Contact({ params }: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await params;
  const t = text[locale] ?? text.en;

  return (
    <SiteShell locale={locale} activeNav="contact">
      <section className="section container">
        <div className="contactLayout">
          <article className="contactCard">
            <h2 className="contactTitle">{t.getInTouch}</h2>

            <div className="contactBlock">
              <h3 className="contactLabel">{t.addressLabel}</h3>
              <p className="contactText">{t.address}</p>
            </div>

            <div className="contactBlock">
              <h3 className="contactLabel">{t.phoneLabel}</h3>
              <ul className="contactPlainList">
                {t.phones.map((phone) => (
                  <li key={phone}>{phone}</li>
                ))}
              </ul>
            </div>

            <div className="contactBlock">
              <h3 className="contactLabel">{t.faxLabel}</h3>
              <p className="contactText">{t.fax}</p>
            </div>

            <div className="contactBlock">
              <h3 className="contactLabel">{t.emailLabel}</h3>
              <p className="contactText">
                <a className="contactLink" href={`mailto:${t.email}`}>
                  {t.email}
                </a>
              </p>
            </div>

            <div className="contactBlock">
              <h3 className="contactLabel">{t.officeHoursLabel}</h3>
              <ul className="contactPlainList">
                {t.officeHours.map((slot) => (
                  <li key={slot}>{slot}</li>
                ))}
              </ul>
            </div>
          </article>

          <article className="contactCard">
            <h2 className="contactTitle">{t.inquiryTitle}</h2>
            <p className="contactIntro">{t.inquiryIntro}</p>

            <form className="contactForm" action="#" method="post">
              <div className="contactField">
                <label htmlFor="contact-name">{t.fullName}</label>
                <input id="contact-name" name="name" type="text" placeholder={t.namePlaceholder} required />
              </div>

              <div className="contactField">
                <label htmlFor="contact-email">{t.emailAddress}</label>
                <input id="contact-email" name="email" type="email" placeholder={t.emailPlaceholder} required />
              </div>

              <div className="contactField">
                <label htmlFor="contact-subject">{t.subject}</label>
                <input id="contact-subject" name="subject" type="text" placeholder={t.subjectPlaceholder} required />
              </div>

              <div className="contactField">
                <label htmlFor="contact-message">{t.message}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder={t.messagePlaceholder}
                  rows={6}
                  required
                />
              </div>

              <button className="contactSubmit" type="submit">
                {t.sendMessage}
              </button>
            </form>
          </article>
        </div>

        <section className="contactMapSection" aria-label={t.mapTitle}>
          <h2 className="contactMapTitle">{t.mapTitle}</h2>
          <div className="contactMapWrap">
            <iframe
              className="contactMapFrame"
              title={t.mapFrameTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=33.714478914901754,73.04048619705408&z=16&output=embed"
            />
          </div>
        </section>
      </section>
    </SiteShell>
  );
}
