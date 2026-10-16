import Link from "next/link";
import { EMBASSY_TIME_ZONE, formatAdminDate } from "@/lib/news-dates";
import { listAllNews, type NewsRecord } from "@/lib/news-store";
import NewsRowActions from "./news-row-actions";

function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EMBASSY_TIME_ZONE,
  });
}

export default async function AdminNewsPage() {
  let items: NewsRecord[] = [];
  let loadError: string | null = null;
  try {
    items = await listAllNews();
  } catch (error) {
    console.error("Loading news for admin failed:", error);
    loadError = "Could not load news from the database. Check the MONGODB_URI setting and try again.";
  }

  const publishedCount = items.filter((item) => item.status === "published").length;

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>News &amp; Events</h1>
          <p className="admMuted">
            {items.length} item{items.length === 1 ? "" : "s"}, {publishedCount} published on the website.
          </p>
        </div>
        <Link href="/admin/news/new" className="admBtn admBtnPrimary">
          + New news item
        </Link>
      </header>

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
              {items.map((item) => (
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
                    {formatUpdated(item.updatedAt)}
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
  );
}
