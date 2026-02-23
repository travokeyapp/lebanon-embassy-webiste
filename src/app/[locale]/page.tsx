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
    emptyNews: "No news for now.",
  },
  ar: {
    heroTitle: "\u0645\u0631\u062d\u0628\u064b\u0627 \u0628\u0643\u0645 \u0641\u064a \u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646",
    heroText:
      "\u062a\u0639\u0632\u064a\u0632 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062f\u0628\u0644\u0648\u0645\u0627\u0633\u064a\u0629 \u0648\u0627\u0644\u062b\u0642\u0627\u0641\u064a\u0629 \u0648\u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f\u064a\u0629 \u0628\u064a\u0646 \u0627\u0644\u062c\u0645\u0647\u0648\u0631\u064a\u0629 \u0627\u0644\u0644\u0628\u0646\u0627\u0646\u064a\u0629 \u0648\u062c\u0645\u0647\u0648\u0631\u064a\u0629 \u0628\u0627\u0643\u0633\u062a\u0627\u0646 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064a\u0629.",
    sectionTitle: "\u0622\u062e\u0631 \u0627\u0644\u0623\u062e\u0628\u0627\u0631 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a",
    headOfMission: "\u0631\u0626\u064a\u0633 \u0627\u0644\u0628\u0639\u062b\u0629",
    placeholder: "[\u0635\u0648\u0631\u0629 \u0627\u0644\u0633\u0641\u064a\u0631]",
    viewAllNews: "\u0639\u0631\u0636 \u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u062e\u0628\u0627\u0631",
    previous: "\u0627\u0644\u0633\u0627\u0628\u0642",
    next: "\u0627\u0644\u062a\u0627\u0644\u064a",
    page: "\u0627\u0644\u0635\u0641\u062d\u0629",
    paginationLabel: "\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u0623\u062e\u0628\u0627\u0631 \u0641\u064a \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    emptyNews: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u062e\u0628\u0627\u0631 \u062d\u0627\u0644\u064a\u064b\u0627.",
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
        <div className="heroSplitVisuals" aria-hidden="true">
          <div className="heroVisual heroVisualFaisal" />
          <div className="heroVisual heroVisualLebanon" />
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
              {pagedNews.length > 0 ? (
                pagedNews.map((item) => (
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
                ))
              ) : (
                <div className="noticeBox">
                  <p>{t.emptyNews}</p>
                </div>
              )}
            </div>

            {pagedNews.length > 0 && totalPages > 1 ? (
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
