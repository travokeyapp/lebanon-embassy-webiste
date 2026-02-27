import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";

type VisaCategory = {
  title: string;
  detail: string;
};

type VisaSpecific = {
  title: string;
  items: string[];
};

type VisaPageContent = {
  title: string;
  lead: string;
  categoriesTitle: string;
  categories: VisaCategory[];
  requiredTitle: string;
  required: string[];
  specialCasesTitle: string;
  specialCases: string[];
  visaSpecificTitle: string;
  visaSpecific: VisaSpecific[];
  feeTitle: string;
  fees: string[];
  processTitle: string;
  process: string[];
  notesTitle: string;
  notes: string[];
  downloadTitle: string;
  downloadHint: string;
  formJpg: string;
  formPdf: string;
  contactTitle: string;
  contactBody: string;
};

const enContent: VisaPageContent = {
  title: "Visa Services",
  lead: "The following requirements are based on the official guidance provided by the Embassy of Lebanon in Islamabad. Submit complete documents according to your visa type.",
  categoriesTitle: "Visa Categories",
  categories: [
    {
      title: "Business Visa",
      detail: "For meetings and business-related travel to Lebanon.",
    },
    {
      title: "Tourist Visa",
      detail: "For short visits and tourism purposes.",
    },
    {
      title: "Family Visit",
      detail: "For visiting family members in Lebanon.",
    },
    {
      title: "Medical Treatment Visit",
      detail: "For medical consultations and treatment in Lebanon.",
    },
    {
      title: "Training Course Visit",
      detail: "For attending training courses in Lebanon.",
    },
    {
      title: "Transit Visa",
      detail: "For transiting via Lebanon to another destination.",
    },
    {
      title: "Study Visit",
      detail: "For study and educational enrollment in Lebanon.",
    },
  ],
  requiredTitle: "Core Required Documents",
  required: [
    "Visa application form completed clearly in capital letters (typed or handwritten) exactly as per passport details.",
    "Colored passport copies (up to page 3 for Business Visa; passport copies required for other visa types).",
    "Recent photograph with white background.",
    "Medical travel insurance.",
    "Hotel reservation OR clear residence address and telephone numbers with sponsor letter.",
    "If sponsor is Lebanese: attach sponsor passport copy, ID card copy, and registration certificate copy.",
    "If sponsor is a foreigner: attach sponsor residence permit valid for at least 3 months.",
    "Tentative flight reservation showing arrival and departure.",
    "Bank statement for the last 3 months OR proof of sufficient funds for stay in Lebanon.",
    "Document proving applicant status (employee, student, retired, company owner).",
    "If not working: provide financial proof documents.",
    "For applicants not residing in their own country: residence permit valid for more than 6 months.",
  ],
  specialCasesTitle: "Special Cases for Travel/Residence Documents",
  specialCases: [
    "Egyptian travel document holders residing in Egypt: residence permit valid for more than 6 months plus Egypt re-entry visa.",
    "Palestinian Authority citizens residing in occupied Palestine: recently issued permission to return to authority territories.",
    "Palestinian Authority and Jordanian applicants without national number residing in occupied Palestine: recently issued permission to return to authority territories.",
    "Holders of travel document (FREMMEDPAS): copy of re-entry document and residence permit valid for at least 6 months.",
  ],
  visaSpecificTitle: "Additional Documents by Visa Type",
  visaSpecific: [
    {
      title: "Business Visa",
      items: [
        "Invitation letter from business partner in Lebanon addressed to Lebanese Embassy, Islamabad, sent directly by email from Lebanon, including duration of stay and inviter contact details.",
        "Copy of business/chamber membership of the invitee.",
        "Proof of business relationship with invitee.",
        "Recommendation note from CCI, FPCCI, or EPB plus membership certificate valid for the current year (two copies).",
        "If approved by the Embassy: attach non-refundable, non-transferable return ticket (two copies).",
      ],
    },
    {
      title: "Tourist Visa",
      items: ["Apply with the core required documents listed above."],
    },
    {
      title: "Family Visit",
      items: [
        "All Tourist Visa/core documents.",
        "Proof of family relationship (birth certificate, marriage certificate, or registration certificate).",
      ],
    },
    {
      title: "Medical Treatment Visit",
      items: [
        "All Tourist Visa/core documents.",
        "Medical reports of the patient and statement/schedule from the concerned doctor indicating required treatment period in Lebanon.",
      ],
    },
    {
      title: "Training Course Visit",
      items: [
        "All Tourist Visa/core documents.",
        "Invitation letter with course program and training duration.",
      ],
    },
    {
      title: "Transit Visa",
      items: [
        "Visa or residence permit of the destination country.",
        "Reservation/ticket for the destination country.",
      ],
    },
    {
      title: "Study Visit",
      items: [
        "Admission documents from officially approved universities, schools, or institutions in Lebanon, or invitation letter from them.",
        "Proof of sufficient funds for study and routine expenses during stay in Lebanon.",
        "Scholarship holders may present scholarship acceptance letter and may be exempted from producing admission and study-financing documents.",
      ],
    },
  ],
  feeTitle: "Business Visa Fees (Cash, After Approval)",
  fees: ["Single Entry: USD 88", "Two Entries: USD 125", "Multiple Entries: USD 175"],
  processTitle: "Application Process",
  process: [
    "Prepare the full document set according to your visa category.",
    "Submit the application at the Embassy during working hours.",
    "Wait for consular review and any additional document requests.",
    "If approved, complete any final submission requirements (such as return ticket copies and applicable fee payment) before visa issuance.",
  ],
  notesTitle: "Important Notes",
  notes: [
    "All required documents must be presented in Arabic, French, or English.",
    "The Directorate General of General Security may request additional documents whenever deemed necessary.",
  ],
  downloadTitle: "Forms Download",
  downloadHint: "Use the official visa form before submitting your application:",
  formJpg: "Visa Form (JPG)",
  formPdf: "Visa Form (PDF)",
  contactTitle: "Need Assistance?",
  contactBody:
    "For updated requirements, processing times, and special cases, contact the Consular Section directly before filing your application.",
};

const arContent: VisaPageContent = {
  title: "خدمات التأشيرات",
  lead: "المتطلبات التالية مبنية على الإرشادات الرسمية الصادرة عن سفارة لبنان في إسلام آباد. يرجى تقديم ملف كامل وفق نوع التأشيرة المطلوبة.",
  categoriesTitle: "فئات التأشيرات",
  categories: [
    {
      title: "تأشيرة أعمال",
      detail: "للاجتماعات والسفر المرتبط بالأعمال إلى لبنان.",
    },
    {
      title: "تأشيرة سياحية",
      detail: "للزيارات القصيرة والسياحة.",
    },
    {
      title: "زيارة عائلية",
      detail: "لزيارة أفراد العائلة في لبنان.",
    },
    {
      title: "زيارة للعلاج الطبي",
      detail: "للاستشارات الطبية وتلقي العلاج في لبنان.",
    },
    {
      title: "زيارة لحضور دورة تدريبية",
      detail: "لحضور دورات تدريبية في لبنان.",
    },
    {
      title: "تأشيرة عبور",
      detail: "للعبور عبر لبنان إلى وجهة أخرى.",
    },
    {
      title: "زيارة للدراسة",
      detail: "للدراسة والالتحاق بالمؤسسات التعليمية في لبنان.",
    },
  ],
  requiredTitle: "المستندات الأساسية المطلوبة",
  required: [
    "نموذج طلب التأشيرة معبأ بوضوح بالأحرف الكبيرة (مطبوعًا أو بخط اليد) ومطابقًا تمامًا لبيانات جواز السفر.",
    "نسخ ملوّنة من جواز السفر (حتى الصفحة الثالثة لتأشيرة الأعمال، ونسخ الجواز مطلوبة لباقي الفئات أيضًا).",
    "صورة شخصية حديثة بخلفية بيضاء.",
    "تأمين سفر طبي.",
    "حجز فندقي أو عنوان إقامة واضح مع أرقام الهاتف ورسالة كفالة/استضافة.",
    "إذا كان الكفيل لبنانيًا: تُرفق نسخة جوازه، ونسخة الهوية، ونسخة شهادة التسجيل.",
    "إذا كان الكفيل أجنبيًا: تُرفق نسخة من إقامة سارية لمدة لا تقل عن 3 أشهر.",
    "حجز طيران مبدئي يوضح تاريخي الوصول والمغادرة.",
    "كشف حساب بنكي لآخر 3 أشهر أو ما يثبت توفر المبلغ الكافي لتغطية الإقامة في لبنان.",
    "مستند يثبت صفة مقدم الطلب (موظف، طالب، متقاعد، صاحب شركة).",
    "لغير العاملين: يجب تقديم مستندات الإثبات المالي.",
    "لمقدم الطلب غير المقيم في بلده الأصلي: إقامة سارية لأكثر من 6 أشهر.",
  ],
  specialCasesTitle: "حالات خاصة لوثائق السفر/الإقامة",
  specialCases: [
    "لحاملي وثيقة السفر المصرية المقيمين في مصر: إقامة سارية لأكثر من 6 أشهر مع تأشيرة عودة إلى مصر.",
    "لمواطني السلطة الفلسطينية المقيمين في الأراضي المحتلة: نسخة حديثة من إذن العودة إلى أراضي السلطة.",
    "لمواطني السلطة الفلسطينية والأردنيين بدون رقم وطني المقيمين في الأراضي المحتلة: نسخة حديثة من إذن العودة إلى أراضي السلطة.",
    "لحاملي وثيقة السفر (FREMMEDPAS): نسخة من وثيقة العودة ونسخة من إقامة سارية لمدة لا تقل عن 6 أشهر.",
  ],
  visaSpecificTitle: "مستندات إضافية حسب نوع التأشيرة",
  visaSpecific: [
    {
      title: "تأشيرة أعمال",
      items: [
        "دعوة من الشريك التجاري في لبنان موجّهة إلى سفارة لبنان في إسلام آباد، تُرسل مباشرة من لبنان عبر البريد الإلكتروني، وتتضمن مدة الإقامة وبيانات الاتصال.",
        "نسخة من عضوية الغرفة/السجل التجاري للجهة الداعية.",
        "إثبات العلاقة التجارية مع الجهة الداعية.",
        "كتاب توصية من CCI أو FPCCI أو EPB مع شهادة عضوية سارية للسنة الحالية (نسختان).",
        "في حال الموافقة: تُرفق تذكرة عودة غير قابلة للاسترداد وغير قابلة للتحويل (نسختان).",
      ],
    },
    {
      title: "تأشيرة سياحية",
      items: ["يتم التقديم وفق المستندات الأساسية المذكورة أعلاه."],
    },
    {
      title: "زيارة عائلية",
      items: [
        "جميع مستندات التأشيرة السياحية/المستندات الأساسية.",
        "إثبات صلة القرابة (شهادة ميلاد أو شهادة زواج أو شهادة تسجيل).",
      ],
    },
    {
      title: "زيارة للعلاج الطبي",
      items: [
        "جميع مستندات التأشيرة السياحية/المستندات الأساسية.",
        "تقارير طبية للمريض وخطاب/جدول من الطبيب المعني يوضح مدة العلاج المطلوبة في لبنان.",
      ],
    },
    {
      title: "زيارة لحضور دورة تدريبية",
      items: [
        "جميع مستندات التأشيرة السياحية/المستندات الأساسية.",
        "دعوة مرفقة ببرنامج الدورة ومدة التدريب.",
      ],
    },
    {
      title: "تأشيرة عبور",
      items: ["تأشيرة أو إقامة سارية لبلد الوجهة.", "حجز/تذكرة إلى بلد الوجهة."],
    },
    {
      title: "زيارة للدراسة",
      items: [
        "مستندات قبول من جامعات أو مدارس أو مؤسسات رسمية معتمدة في لبنان، أو دعوة منها.",
        "ما يثبت توفر مبلغ كافٍ لتغطية الدراسة والمصاريف المعيشية أثناء الإقامة في لبنان.",
        "يمكن إعفاء الحاصلين على منحة من تقديم مستندات القبول وإثبات التمويل عند تقديم كتاب قبول المنحة.",
      ],
    },
  ],
  feeTitle: "رسوم تأشيرة الأعمال (نقدًا بعد الموافقة)",
  fees: ["دخول مرة واحدة: 88 دولار أمريكي", "دخول مرتين: 125 دولار أمريكي", "دخول متعدد: 175 دولار أمريكي"],
  processTitle: "آلية التقديم",
  process: [
    "تحضير ملف المستندات كاملًا بحسب فئة التأشيرة المطلوبة.",
    "تقديم الطلب في السفارة خلال أوقات الدوام.",
    "انتظار المراجعة القنصلية وأي طلبات استكمال إضافية.",
    "عند الموافقة، استكمال المتطلبات النهائية (مثل نسخ تذكرة العودة ودفع الرسوم المطبقة) قبل إصدار التأشيرة.",
  ],
  notesTitle: "ملاحظات مهمة",
  notes: [
    "يجب تقديم جميع المستندات المطلوبة باللغة العربية أو الفرنسية أو الإنجليزية.",
    "يحق للمديرية العامة للأمن العام طلب مستندات إضافية كلما رأت ذلك ضروريًا.",
  ],
  downloadTitle: "تنزيل النماذج",
  downloadHint: "يرجى استخدام نموذج التأشيرة الرسمي قبل تقديم الطلب:",
  formJpg: "نموذج التأشيرة (JPG)",
  formPdf: "نموذج التأشيرة (PDF)",
  contactTitle: "بحاجة إلى مساعدة؟",
  contactBody:
    "للاطلاع على المتطلبات المحدثة ومدد المعالجة والحالات الخاصة، يرجى التواصل مباشرة مع القسم القنصلي قبل تقديم المعاملة.",
};

const content: Record<"en" | "ar", VisaPageContent> = {
  en: enContent,
  ar: arContent,
};

export default async function VisasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];

  return (
    <SiteShell locale={locale} activeNav="visas">
      <section className="section container">
        <div className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </div>

        <article className="card stack">
          <h3>{t.categoriesTitle}</h3>
          <div className="quickGrid">
            {t.categories.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </article>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.requiredTitle}</h3>
            <ul className="bulletList">
              {t.required.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>{t.specialCasesTitle}</h3>
            <ul className="bulletList">
              {t.specialCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <article className="card stack">
          <h3>{t.visaSpecificTitle}</h3>
          <div className="quickGrid">
            {t.visaSpecific.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <ul className="bulletList">
                  {item.items.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.feeTitle}</h3>
            <ul className="bulletList">
              {t.fees.map((fee) => (
                <li key={fee}>{fee}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>{t.notesTitle}</h3>
            <ul className="bulletList">
              {t.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="contentSplit">
          <article className="card">
            <h3>{t.processTitle}</h3>
            <ol className="stepList">
              {t.process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="card stack">
            <h3>{t.downloadTitle}</h3>
            <p>{t.downloadHint}</p>
            <div className="downloadActions">
              <a className="downloadButton" href="/visa-form.jpg" target="_blank" rel="noreferrer">
                {t.formJpg}
              </a>
              <a className="downloadButton" href="/visa-form.pdf" target="_blank" rel="noreferrer">
                {t.formPdf}
              </a>
            </div>
          </article>
        </div>

        <article className="card stack">
          <h3>{t.contactTitle}</h3>
          <p>{t.contactBody}</p>
        </article>
      </section>
    </SiteShell>
  );
}
