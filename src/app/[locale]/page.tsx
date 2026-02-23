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
    heroPlacesLabel: "Hero places",
    heroPakistan: "Pakistan",
    heroLebanon: "Lebanon",
    heroPakistanSlides: [
      {
        title: "Pakistan Monument",
        subtitle: "National monument at Shakarparian, Islamabad.",
      },
      {
        title: "Faisal Mosque",
        subtitle: "Iconic mosque at the foothills of Margalla Hills.",
      },
      {
        title: "Pakistan Monument",
        subtitle: "National monument at Shakarparian, Islamabad.",
      },
      {
        title: "Faisal Mosque",
        subtitle: "Iconic mosque at the foothills of Margalla Hills.",
      },
    ],
    heroLebanonSlides: [
      {
        title: "Baalbek Ruins",
        subtitle: "Roman-era temples in one of Lebanon's historic sites.",
      },
      {
        title: "Byblos Old Port",
        subtitle: "Ancient coastal harbor in one of the oldest cities.",
      },
      {
        title: "Byblos Castle",
        subtitle: "Historic stone fortress overlooking the Lebanese coast.",
      },
      {
        title: "Zaitunay Bay",
        subtitle: "Contemporary waterfront promenade in Beirut.",
      },
    ],
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
    heroPlacesLabel: "\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0635\u0648\u0631 \u0641\u064a \u0627\u0644\u0648\u0627\u062c\u0647\u0629",
    heroPakistan: "\u0628\u0627\u0643\u0633\u062a\u0627\u0646",
    heroLebanon: "\u0644\u0628\u0646\u0627\u0646",
    heroPakistanSlides: [
      {
        title: "\u0627\u0644\u0646\u0635\u0628 \u0627\u0644\u062a\u0630\u0643\u0627\u0631\u064a \u0644\u0628\u0627\u0643\u0633\u062a\u0627\u0646",
        subtitle: "\u0645\u0639\u0644\u0645 \u0648\u0637\u0646\u064a \u0641\u064a \u0634\u0627\u0643\u0631\u0628\u0627\u0631\u064a\u0627\u0646\u060c \u0625\u0633\u0644\u0627\u0645 \u0623\u0628\u0627\u062f.",
      },
      {
        title: "\u0645\u0633\u062c\u062f \u0641\u064a\u0635\u0644",
        subtitle: "\u0645\u0633\u062c\u062f \u0623\u064a\u0642\u0648\u0646\u064a \u0639\u0646\u062f \u0633\u0641\u0648\u062d \u062a\u0644\u0627\u0644 \u0645\u0631\u062c\u0644\u0627.",
      },
      {
        title: "\u0627\u0644\u0646\u0635\u0628 \u0627\u0644\u062a\u0630\u0643\u0627\u0631\u064a \u0644\u0628\u0627\u0643\u0633\u062a\u0627\u0646",
        subtitle: "\u0645\u0639\u0644\u0645 \u0648\u0637\u0646\u064a \u0641\u064a \u0634\u0627\u0643\u0631\u0628\u0627\u0631\u064a\u0627\u0646\u060c \u0625\u0633\u0644\u0627\u0645 \u0623\u0628\u0627\u062f.",
      },
      {
        title: "\u0645\u0633\u062c\u062f \u0641\u064a\u0635\u0644",
        subtitle: "\u0645\u0633\u062c\u062f \u0623\u064a\u0642\u0648\u0646\u064a \u0639\u0646\u062f \u0633\u0641\u0648\u062d \u062a\u0644\u0627\u0644 \u0645\u0631\u062c\u0644\u0627.",
      },
    ],
    heroLebanonSlides: [
      {
        title: "\u0622\u062b\u0627\u0631 \u0628\u0639\u0644\u0628\u0643",
        subtitle: "\u0645\u0639\u0627\u0628\u062f \u0631\u0648\u0645\u0627\u0646\u064a\u0629 \u0641\u064a \u0623\u062d\u062f \u0623\u0628\u0631\u0632 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u062a\u0627\u0631\u064a\u062e\u064a\u0629 \u0641\u064a \u0644\u0628\u0646\u0627\u0646.",
      },
      {
        title: "\u0645\u0631\u0641\u0623 \u062c\u0628\u064a\u0644 \u0627\u0644\u0642\u062f\u064a\u0645",
        subtitle: "\u0645\u064a\u0646\u0627\u0621 \u0633\u0627\u062d\u0644\u064a \u0639\u0631\u064a\u0642 \u0641\u064a \u0648\u0627\u062d\u062f\u0629 \u0645\u0646 \u0623\u0642\u062f\u0645 \u0627\u0644\u0645\u062f\u0646.",
      },
      {
        title: "\u0642\u0644\u0639\u0629 \u062c\u0628\u064a\u0644",
        subtitle: "\u0642\u0644\u0639\u0629 \u062d\u062c\u0631\u064a\u0629 \u062a\u0627\u0631\u064a\u062e\u064a\u0629 \u062a\u0637\u0644 \u0639\u0644\u0649 \u0633\u0627\u062d\u0644 \u0644\u0628\u0646\u0627\u0646.",
      },
      {
        title: "\u0632\u064a\u062a\u0648\u0646\u0629 \u0628\u0627\u064a",
        subtitle: "\u0648\u0627\u062c\u0647\u0629 \u0628\u062d\u0631\u064a\u0629 \u0639\u0635\u0631\u064a\u0629 \u0641\u064a \u0628\u064a\u0631\u0648\u062a.",
      },
    ],
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
        <div className="heroSplitVisuals">
          <div className="heroVisual heroVisualPakistan" role="img" aria-label={t.heroPakistan}>
            <div className="heroSlides" aria-hidden="true">
              <div className="heroSlide heroSlidePakistan1" />
              <div className="heroSlide heroSlidePakistan2" />
              <div className="heroSlide heroSlidePakistan3" />
              <div className="heroSlide heroSlidePakistan4" />
            </div>
          </div>
          <div className="heroVisual heroVisualLebanon" role="img" aria-label={t.heroLebanon}>
            <div className="heroSlides" aria-hidden="true">
              <div className="heroSlide heroSlideLebanon1" />
              <div className="heroSlide heroSlideLebanon2" />
              <div className="heroSlide heroSlideLebanon3" />
              <div className="heroSlide heroSlideLebanon4" />
            </div>
          </div>
        </div>
        <div className="heroPlacesBar" aria-label={t.heroPlacesLabel}>
          <div className="heroPlaceTrack">
            {t.heroPakistanSlides.map((item, index) => (
              <div className={`heroPlaceItem heroPlaceFrame${index + 1}`} key={`${item.title}-${index}`}>
                <span className="heroPlaceCountry">{t.heroPakistan}</span>
                <span className="heroPlaceName">{item.title}</span>
                <span className="heroPlaceSub">{item.subtitle}</span>
              </div>
            ))}
          </div>
          <div className="heroPlaceTrack">
            {t.heroLebanonSlides.map((item, index) => (
              <div className={`heroPlaceItem heroPlaceFrame${index + 1}`} key={`${item.title}-${index}`}>
                <span className="heroPlaceCountry">{t.heroLebanon}</span>
                <span className="heroPlaceName">{item.title}</span>
                <span className="heroPlaceSub">{item.subtitle}</span>
              </div>
            ))}
          </div>
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
