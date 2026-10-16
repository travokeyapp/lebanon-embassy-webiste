import Link from "next/link";
import { formatAdminDate, formatAdminDateTime } from "@/lib/news-dates";
import { listAllNews, type NewsRecord } from "@/lib/news-store";
import { refreshSiteCacheAction } from "./actions";
import NewsRowActions from "./news-row-actions";
import { requireArea } from "@/lib/auth/session";

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  saved?: string | string[];
  slug?: string | string[];
  refreshed?: string | string[];
};

type StatusFilter = "all" | "published" | "draft";

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function matchesQuery(item: NewsRecord, needle: string): boolean {
  if (!needle) {
    return true;
  }
  const haystack = [item.title.en, item.title.ar, item.slug, item.excerpt.en].join("\n").toLowerCase();
  return haystack.includes(needle);
}

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireArea("news");
  const query = await searchParams;
  const q = first(query.q).trim();
  const statusParam = first(query.status);
  const statusFilter: StatusFilter =
    statusParam === "published" || statusParam === "draft" ? statusParam : "all";
  const saved = first(query.saved);
  const savedSlug = first(query.slug);
  const refreshed = first(query.refreshed) === "1";

  let items: NewsRecord[] = [];
  let loadError: string | null = null;
  try {
    items = await listAllNews();
  } catch (error) {
    console.error("Loading news for admin failed:", error);
    loadError = "Could not load news from the database. Check the MONGODB_URI setting and try again.";
  }

  const publishedCount = items.filter((item) => item.status === "published").length;
  const needle = q.toLowerCase();
  const visible = items.filter(
    (item) => (statusFilter === "all" || item.status === statusFilter) && matchesQuery(item, needle),
  );
  const filtering = q !== "" || statusFilter !== "all";

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>News &amp; Events</h1>
          <p className="admMuted">
            {items.length} item{items.length === 1 ? "" : "s"}, {publishedCount} published on the website.
          </p>
        </div>
        <div className="admHeadActions">
          <form action={refreshSiteCacheAction}>
            <button type="submit" className="admBtn admBtnGhost" title="Make the public website re-read the news from the database">
              Refresh website
            </button>
          </form>
          <Link href="/admin/news/new" className="admBtn admBtnPrimary">
            + New news item
          </Link>
        </div>
      </header>

      {refreshed ? (
        <p className="admAlert admAlertSuccess" role="status">
          Website refreshed. The public pages now show exactly what is in the database.
        </p>
      ) : null}

      {saved === "published" ? (
        <p className="admAlert admAlertSuccess" role="status">
          Published. The item is now live on the website.{" "}
          {savedSlug ? (
            <a href={`/en/news?item=${encodeURIComponent(savedSlug)}#${savedSlug}`} target="_blank" rel="noreferrer">
              View it on the website
            </a>
          ) : null}
        </p>
      ) : null}
      {saved === "draft" ? (
        <p className="admAlert admAlertSuccess" role="status">
          Saved as a draft. It is not shown on the website until you publish it.
        </p>
      ) : null}

      {loadError ? (
        <p className="admAlert admAlertError" role="alert">
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <section className="admCard admEmpty">
          <p>No news items yet.</p>
          <Link href="/admin/news/new" className="admBtn admBtnPrimary">
            Create the first one
          </Link>
        </section>
      ) : (
        <>
          <form className="admFilterBar" method="get" action="/admin/news" role="search">
            <input
              className="admInput admFilterSearch"
              type="search"
              name="q"
              placeholder="Search title or slug"
              defaultValue={q}
              aria-label="Search news items"
            />
            <select className="admInput admSelect" name="status" defaultValue={statusFilter} aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <button type="submit" className="admBtn">
              Search
            </button>
            {filtering ? (
              <Link href="/admin/news" className="admBtn admBtnGhost">
                Clear
              </Link>
            ) : null}
            {filtering ? (
              <span className="admMuted admFilterCount">
                Showing {visible.length} of {items.length}
              </span>
            ) : null}
          </form>

          {visible.length === 0 ? (
            <section className="admCard admEmpty">
              <p>No items match your search.</p>
            </section>
          ) : (
            <section className="admCard admTableWrap">
              <table className="admTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Last updated</th>
                    <th className="admColActions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.id}>
                      <td className="admNowrap">{formatAdminDate(item.date)}</td>
                      <td>
                        <Link href={`/admin/news/${item.id}`} className="admRowTitle">
                          {item.title.en || "(untitled)"}
                        </Link>
                        {item.title.ar ? (
                          <div className="admRowSub" dir="rtl" lang="ar">
                            {item.title.ar}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <span className={`admBadge admBadge-${item.status}`}>
                          {item.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="admNowrap admMuted">
                        {formatAdminDateTime(item.updatedAt)}
                        <br />
                        <small>{item.updatedBy}</small>
                      </td>
                      <td className="admColActions">
                        <NewsRowActions id={item.id} slug={item.slug} status={item.status} title={item.title.en} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </>
  );
}
