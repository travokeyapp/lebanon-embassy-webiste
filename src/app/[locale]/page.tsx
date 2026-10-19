import Link from "next/link";
import HydrationSafeImage from "@/components/hydration-safe-image";
import NewsCard from "@/components/news-card";
import SiteShell from "@/components/site-shell";
import { getHeroContent } from "@/lib/content/hero-public";
import type { HeroSlide } from "@/lib/content/hero-schema";
import { tx } from "@/lib/content/page-schema";
import { getPageContent } from "@/lib/content/pages-public";
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
    sectionTitle: "Latest News & Events",
    headOfMission: "Head of Mission",
    missionName: "H.E. Abdulaziz ISSA",
    missionRole: "Ambassador of Lebanon to Pakistan",
    missionCta: "Read Ambassador Message",
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
    sectionTitle: "\u0622\u062e\u0631 \u0627\u0644\u0623\u062e\u0628\u0627\u0631 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a",
    headOfMission: "\u0631\u0626\u064a\u0633 \u0627\u0644\u0628\u0639\u062b\u0629",
    missionName: "\u0633\u0639\u0627\u062f\u0629 \u0627\u0644\u0633\u0641\u064a\u0631 \u0639\u0628\u062f \u0627\u0644\u0639\u0632\u064a\u0632 \u0639\u064a\u0633\u0649",
    missionRole: "\u0633\u0641\u064a\u0631 \u0644\u0628\u0646\u0627\u0646 \u0644\u062f\u0649 \u0628\u0627\u0643\u0633\u062a\u0627\u0646",
    missionCta: "\u0642\u0631\u0627\u0621\u0629 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0633\u0641\u064a\u0631",
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

  const [newsItems, ambassador, hero] = await Promise.all([
    getNewsForLocale(locale),
    getPageContent("ambassador"),
    getHeroContent(),
  ]);
  const slideStyle = (slide: HeroSlide) => ({
    backgroundImage: `url("${slide.image.src}")`,
    backgroundSize: slide.fit,
    backgroundPosition: slide.position,
    backgroundColor: slide.fit === "cover" ? "transparent" : undefined,
  });
  const mission = {
    name: tx(ambassador.fields.name, locale) || t.missionName,
    role: tx(ambassador.fields.role, locale) || t.missionRole,
    portrait: ambassador.images.homePortrait ?? ambassador.images.portrait ?? null,
  };
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
              {hero.pakistan.map((slide, index) => (
                <div className={`heroSlide heroSlidePakistan${index + 1}`} style={slideStyle(slide)} key={`pk-${index}`} />
              ))}
            </div>
          </div>
          <div className="heroVisual heroVisualLebanon" role="img" aria-label={t.heroLebanon}>
            <div className="heroSlides" aria-hidden="true">
              {hero.lebanon.map((slide, index) => (
                <div className={`heroSlide heroSlideLebanon${index + 1}`} style={slideStyle(slide)} key={`lb-${index}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="heroPlacesBar" aria-label={t.heroPlacesLabel}>
          <div className="heroPlaceTrack">
            {hero.pakistan.map((item, index) => (
              <div className={`heroPlaceItem heroPlaceFrame${index + 1}`} key={`pk-caption-${index}`}>
                <span className="heroPlaceCountry">{t.heroPakistan}</span>
                <span className="heroPlaceName">{tx(item.title, locale)}</span>
                <span className="heroPlaceSub">{tx(item.subtitle, locale)}</span>
              </div>
            ))}
          </div>
          <div className="heroPlaceTrack">
            {hero.lebanon.map((item, index) => (
              <div className={`heroPlaceItem heroPlaceFrame${index + 1}`} key={`lb-caption-${index}`}>
                <span className="heroPlaceCountry">{t.heroLebanon}</span>
                <span className="heroPlaceName">{tx(item.title, locale)}</span>
                <span className="heroPlaceSub">{tx(item.subtitle, locale)}</span>
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
                  <NewsCard key={item.slug} item={item} titleHref={`/${locale}/news?item=${item.slug}#${item.slug}`} />
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
            {mission.portrait ? (
              <div className="ambassadorPortraitWrap missionPortraitWrap">
                <HydrationSafeImage
                  src={mission.portrait.src}
                  alt={tx(mission.portrait.alt, locale) || mission.name}
                  width={mission.portrait.width}
                  height={mission.portrait.height}
                  className="ambassadorPortrait"
                />
              </div>
            ) : null}
            <p className="missionName">{mission.name}</p>
            <p className="muted">{mission.role}</p>
            <Link className="relationsBioButton" href={`/${locale}/ambassador`}>
              {t.missionCta}
            </Link>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
