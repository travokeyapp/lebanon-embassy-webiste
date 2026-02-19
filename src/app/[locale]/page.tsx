import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";
import {
  HOME_NEWS_PAGE_SIZE,
  clampPage,
  getNewsForLocale,
  paginateItems,
  parsePageParam,
} from "@/lib/news";

const content = {
  en: {
    heroTitle: "Welcome to the Embassy of Lebanon",
    heroText:
      "Strengthening diplomatic, cultural, and economic ties between the Lebanese Republic and the Islamic Republic of Pakistan.",
    sectionTitle: "Latest News & Events",
    headOfMission: "Head of Mission",
    placeholder: "[Photo of Ambassador]",
    viewAllNews: "View All News",
    previous: "Previous",
    next: "Next",
    page: "Page",
    paginationLabel: "Homepage news pages",
  },
  ar: {
    heroTitle: "مرحبًا بكم في سفارة لبنان",
    heroText: "تعزيز الروابط الدبلوماسية والثقافية والاقتصادية بين الجمهورية اللبنانية وجمهورية باكستان الإسلامية.",
    sectionTitle: "آخر الأخبار والفعاليات",
    headOfMission: "رئيس البعثة",
    placeholder: "[صورة السفير]",
    viewAllNews: "عرض جميع الأخبار",
    previous: "السابق",
    next: "التالي",
    page: "الصفحة",
    paginationLabel: "صفحات الأخبار في الصفحة الرئيسية",
  },
};

type HomeSearchParams = {
  newsPage?: string | string[];
};

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<HomeSearchParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = content[locale];

  const newsItems = getNewsForLocale(locale);
  const query = (await searchParams) ?? {};
  const totalPages = Math.max(1, Math.ceil(newsItems.length / HOME_NEWS_PAGE_SIZE));
  const requestedPage = parsePageParam(query.newsPage);
  const currentPage = clampPage(requestedPage, totalPages);
  const pagedNews = paginateItems(newsItems, currentPage, HOME_NEWS_PAGE_SIZE);

  const toHomeNewsPage = (page: number) => {
    if (page <= 1) {
      return `/${locale}#latest-news`;
    }
    return `/${locale}?newsPage=${page}#latest-news`;
  };

  return (
    <SiteShell locale={locale} activeNav="home">
      <section className="heroBlock">
        <div className="welcomePanel">
          <h2>{t.heroTitle}</h2>
          <p>{t.heroText}</p>
        </div>
      </section>

      <section className="newsSection" id="latest-news">
        <div className="container newsGrid">
          <div>
            <div className="newsHeaderRow">
              <h3 className="newsHeading">{t.sectionTitle}</h3>
              <Link className="newsViewAllLink" href={`/${locale}/news`}>
                {t.viewAllNews}
              </Link>
            </div>

            <div className="newsList">
              {pagedNews.map((item) => (
                <article className="newsItem" key={item.slug}>
                  <div className="dateBox">
                    <span>{item.month}</span>
                    <strong>{item.day}</strong>
                  </div>

                  <div>
                    <h4>
                      <Link className="newsTitleLink" href={`/${locale}/news?item=${item.slug}#${item.slug}`}>
                        {item.title}
                      </Link>
                    </h4>
                    <p>{item.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <nav className="newsPagination" aria-label={t.paginationLabel}>
                {currentPage > 1 ? (
                  <Link className="newsPageLink" href={toHomeNewsPage(currentPage - 1)}>
                    {t.previous}
                  </Link>
                ) : (
                  <span className="newsPageLink isDisabled">{t.previous}</span>
                )}

                <span className="newsPageInfo">
                  {t.page} {currentPage} / {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link className="newsPageLink" href={toHomeNewsPage(currentPage + 1)}>
                    {t.next}
                  </Link>
                ) : (
                  <span className="newsPageLink isDisabled">{t.next}</span>
                )}
              </nav>
            ) : null}
          </div>

          <aside className="missionCard">
            <h4>{t.headOfMission}</h4>
            <div className="missionPlaceholder">{t.placeholder}</div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
