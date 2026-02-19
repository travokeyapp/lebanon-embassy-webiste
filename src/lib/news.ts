import type { Locale } from "@/lib/locale";

export type NewsItem = {
  slug: string;
  month: string;
  day: string;
  title: string;
  excerpt: string;
};

const enNews: NewsItem[] = [
  {
    slug: "minister-commerce-meeting",
    month: "JAN",
    day: "15",
    title: "Ambassador Issa meets with Federal Minister of Commerce",
    excerpt:
      "H.E. Mr. Abdulaziz Issa discussed bilateral trade priorities and practical steps to improve private-sector cooperation between Lebanon and Pakistan.",
  },
  {
    slug: "independence-day-reception",
    month: "DEC",
    day: "08",
    title: "Embassy celebrates Lebanese Independence Day",
    excerpt:
      "The Embassy hosted a reception with diplomatic representatives, government officials, and members of the Lebanese community in Pakistan.",
  },
  {
    slug: "consular-hours-update",
    month: "NOV",
    day: "27",
    title: "Consular section announces updated public hours",
    excerpt:
      "The Embassy published updated walk-in timings to improve service flow for passport, attestation, and civil status requests.",
  },
  {
    slug: "student-cultural-exchange",
    month: "OCT",
    day: "12",
    title: "Student cultural exchange forum held in Islamabad",
    excerpt:
      "Lebanese and Pakistani students joined a dialogue on higher education collaboration, culture, and language exchange initiatives.",
  },
  {
    slug: "trade-dialogue-chambers",
    month: "SEP",
    day: "21",
    title: "Embassy joins business chambers for trade dialogue",
    excerpt:
      "The mission participated in a policy roundtable on market access, logistics, and opportunities for bilateral commercial partnerships.",
  },
  {
    slug: "humanitarian-coordination-briefing",
    month: "AUG",
    day: "09",
    title: "Humanitarian coordination briefing with partner agencies",
    excerpt:
      "Officials exchanged updates on relief coordination channels and mechanisms to support affected communities when needed.",
  },
  {
    slug: "visa-advisory-summer",
    month: "JUL",
    day: "03",
    title: "Embassy issues summer visa advisory",
    excerpt:
      "Applicants were advised to submit complete files early due to seasonal demand and to verify document requirements before applying.",
  },
  {
    slug: "diaspora-community-dialogue",
    month: "JUN",
    day: "18",
    title: "Community dialogue held with Lebanese diaspora representatives",
    excerpt:
      "The Embassy held a consultation session covering consular priorities, education support, and improved communication channels.",
  },
];

const arNews: NewsItem[] = [
  {
    slug: "minister-commerce-meeting",
    month: "يناير",
    day: "15",
    title: "لقاء السفير عيسى مع وزير التجارة الفيدرالي",
    excerpt:
      "بحث سعادة السفير عبدالعزيز عيسى أولويات التعاون التجاري والخطوات العملية لتعزيز الشراكات الاقتصادية بين لبنان وباكستان.",
  },
  {
    slug: "independence-day-reception",
    month: "ديسمبر",
    day: "08",
    title: "السفارة تحتفل بعيد الاستقلال اللبناني",
    excerpt:
      "استضافت السفارة حفل استقبال بحضور ممثلين دبلوماسيين ومسؤولين حكوميين وأبناء الجالية اللبنانية في باكستان.",
  },
  {
    slug: "consular-hours-update",
    month: "نوفمبر",
    day: "27",
    title: "القسم القنصلي يعلن تحديث ساعات استقبال المراجعين",
    excerpt:
      "نشرت السفارة أوقات مراجعة جديدة لتحسين تدفق الخدمات القنصلية المتعلقة بالجوازات والتصديقات ومعاملات الأحوال الشخصية.",
  },
  {
    slug: "student-cultural-exchange",
    month: "أكتوبر",
    day: "12",
    title: "منتدى للتبادل الثقافي الطلابي في إسلام آباد",
    excerpt:
      "شارك طلاب لبنانيون وباكستانيون في حوار حول التعاون الأكاديمي والثقافي ومبادرات تبادل اللغة.",
  },
  {
    slug: "trade-dialogue-chambers",
    month: "سبتمبر",
    day: "21",
    title: "السفارة تشارك في حوار تجاري مع غرف الأعمال",
    excerpt:
      "شاركت البعثة في مائدة مستديرة حول الوصول إلى الأسواق والخدمات اللوجستية وفرص الشراكات التجارية الثنائية.",
  },
  {
    slug: "humanitarian-coordination-briefing",
    month: "أغسطس",
    day: "09",
    title: "إحاطة حول تنسيق الجهود الإنسانية مع الجهات الشريكة",
    excerpt:
      "تبادل المسؤولون تحديثات بشأن قنوات التنسيق الإغاثي وآليات دعم المجتمعات المتضررة عند الحاجة.",
  },
  {
    slug: "visa-advisory-summer",
    month: "يوليو",
    day: "03",
    title: "السفارة تصدر تنبيهًا صيفيًا بخصوص التأشيرات",
    excerpt:
      "تمت دعوة المتقدمين لتقديم الملفات مكتملة مبكرًا بسبب الضغط الموسمي والتأكد من المتطلبات قبل التقديم.",
  },
  {
    slug: "diaspora-community-dialogue",
    month: "يونيو",
    day: "18",
    title: "جلسة حوار مع ممثلي الجالية اللبنانية",
    excerpt:
      "عقدت السفارة جلسة تشاورية تناولت أولويات الخدمات القنصلية ودعم التعليم وتطوير قنوات التواصل.",
  },
];

const newsByLocale: Record<Locale, NewsItem[]> = {
  en: enNews,
  ar: arNews,
};

export const HOME_NEWS_PAGE_SIZE = 3;
export const NEWS_ARCHIVE_PAGE_SIZE = 6;

export function getNewsForLocale(locale: Locale): NewsItem[] {
  return newsByLocale[locale];
}

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function findPageBySlug(items: NewsItem[], slug: string, pageSize: number): number | null {
  const index = items.findIndex((item) => item.slug === slug);
  if (index < 0) {
    return null;
  }
  return Math.floor(index / pageSize) + 1;
}
