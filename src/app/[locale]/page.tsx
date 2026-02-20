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
    heroTitle: "Ù…Ø±Ø­Ø¨Ù‹Ø§ Ø¨ÙƒÙ… ÙÙŠ Ø³ÙØ§Ø±Ø© Ù„Ø¨Ù†Ø§Ù†",
    heroText: "ØªØ¹Ø²ÙŠØ² Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ø¯Ø¨Ù„ÙˆÙ…Ø§Ø³ÙŠØ© ÙˆØ§Ù„Ø«Ù‚Ø§ÙÙŠØ© ÙˆØ§Ù„Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© Ø¨ÙŠÙ† Ø§Ù„Ø¬Ù…Ù‡ÙˆØ±ÙŠØ© Ø§Ù„Ù„Ø¨Ù†Ø§Ù†ÙŠØ© ÙˆØ¬Ù…Ù‡ÙˆØ±ÙŠØ© Ø¨Ø§ÙƒØ³ØªØ§Ù† Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©.",
    sectionTitle: "Ø¢Ø®Ø± Ø§Ù„Ø£Ø®Ø¨Ø§Ø± ÙˆØ§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª",
    headOfMission: "Ø±Ø¦ÙŠØ³ Ø§Ù„Ø¨Ø¹Ø«Ø©",
    placeholder: "[ØµÙˆØ±Ø© Ø§Ù„Ø³ÙÙŠØ±]",
    viewAllNews: "Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø®Ø¨Ø§Ø±",
    previous: "Ø§Ù„Ø³Ø§Ø¨Ù‚",
    next: "Ø§Ù„ØªØ§Ù„ÙŠ",
    page: "Ø§Ù„ØµÙØ­Ø©",
    paginationLabel: "ØµÙØ­Ø§Øª Ø§Ù„Ø£Ø®Ø¨Ø§Ø± ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    emptyNews: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ø®Ø¨Ø§Ø± Ø­Ø§Ù„ÙŠÙ‹Ø§.",
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
