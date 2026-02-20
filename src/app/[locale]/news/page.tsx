import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { normalizeLocale } from "@/lib/locale";
import {
  NEWS_ARCHIVE_PAGE_SIZE,
  clampPage,
  findPageBySlug,
  getNewsForLocale,
  paginateItems,
  parsePageParam,
} from "@/lib/news";

const copy = {
  en: {
    title: "News & Events",
    lead: "All official Embassy announcements, updates, and event notes.",
    previous: "Previous",
    next: "Next",
    page: "Page",
    backHome: "Back to Home",
    paginationLabel: "News archive pages",
  },
  ar: {
    title: "الأخبار والفعاليات",
    lead: "جميع الإعلانات الرسمية والتحديثات وموجزات الفعاليات الصادرة عن السفارة.",
    previous: "السابق",
    next: "التالي",
    page: "الصفحة",
    backHome: "العودة إلى الرئيسية",
    paginationLabel: "صفحات أرشيف الأخبار",
  },
};

type NewsSearchParams = {
  page?: string | string[];
  item?: string | string[];
};

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<NewsSearchParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = copy[locale];
  const emptyNewsText = locale === "ar" ? "لا توجد أخبار حاليًا." : "No news for now.";
  const newsItems = getNewsForLocale(locale);
  const query = (await searchParams) ?? {};

  const totalPages = Math.max(1, Math.ceil(newsItems.length / NEWS_ARCHIVE_PAGE_SIZE));
  const requestedPage = parsePageParam(query.page);
  const focusSlug = Array.isArray(query.item) ? query.item[0] : query.item;
  const focusPage = focusSlug ? findPageBySlug(newsItems, focusSlug, NEWS_ARCHIVE_PAGE_SIZE) : null;
  const currentPage = clampPage(focusPage ?? requestedPage, totalPages);
  const pageItems = paginateItems(newsItems, currentPage, NEWS_ARCHIVE_PAGE_SIZE);

  const toArchivePage = (page: number) => {
    if (page <= 1) {
      return `/${locale}/news`;
    }
    return `/${locale}/news?page=${page}`;
  };

  return (
    <SiteShell locale={locale}>
      <section className="section container">
        <header className="pageHeader">
          <h2 className="pageTitle">{t.title}</h2>
          <p className="sectionLead">{t.lead}</p>
        </header>

        <div className="newsList newsArchiveList">
          {pageItems.length > 0 ? (
            pageItems.map((item) => (
              <article className="newsItem" key={item.slug} id={item.slug}>
                <div className="dateBox">
                  <span>{item.month}</span>
                  <strong>{item.day}</strong>
                </div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.excerpt}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="noticeBox">
              <p>{emptyNewsText}</p>
            </div>
          )}
        </div>

        {pageItems.length > 0 ? (
          <nav className="newsPagination newsPaginationWide" aria-label={t.paginationLabel}>
            {currentPage > 1 ? (
              <Link className="newsPageLink" href={toArchivePage(currentPage - 1)}>
                {t.previous}
              </Link>
            ) : (
              <span className="newsPageLink isDisabled">{t.previous}</span>
            )}

            <span className="newsPageInfo">
              {t.page} {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link className="newsPageLink" href={toArchivePage(currentPage + 1)}>
                {t.next}
              </Link>
            ) : (
              <span className="newsPageLink isDisabled">{t.next}</span>
            )}

            <Link className="newsBackHomeLink" href={`/${locale}`}>
              {t.backHome}
            </Link>
          </nav>
        ) : null}
      </section>
    </SiteShell>
  );
}
