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
    title: "\u0627\u0644\u0623\u062e\u0628\u0627\u0631 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a",
    lead: "\u062c\u0645\u064a\u0639 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0648\u0627\u0644\u062a\u062d\u062f\u064a\u062b\u0627\u062a \u0648\u0645\u0648\u062c\u0632\u0627\u062a \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a \u0627\u0644\u0635\u0627\u062f\u0631\u0629 \u0639\u0646 \u0627\u0644\u0633\u0641\u0627\u0631\u0629.",
    previous: "\u0627\u0644\u0633\u0627\u0628\u0642",
    next: "\u0627\u0644\u062a\u0627\u0644\u064a",
    page: "\u0627\u0644\u0635\u0641\u062d\u0629",
    backHome: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    paginationLabel: "\u0635\u0641\u062d\u0627\u062a \u0623\u0631\u0634\u064a\u0641 \u0627\u0644\u0623\u062e\u0628\u0627\u0631",
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
  const emptyNewsText = locale === "ar" ? "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u062e\u0628\u0627\u0631 \u062d\u0627\u0644\u064a\u064b\u0627." : "No news for now.";
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
