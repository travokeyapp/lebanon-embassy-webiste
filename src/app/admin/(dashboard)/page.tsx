import Link from "next/link";
import { describeAuditAction, listAuditEntries, type AuditRecord } from "@/lib/audit";
import { requireActiveUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";
import { announcementState } from "@/lib/content/announcements-schema";
import { listAnnouncements } from "@/lib/content/announcements-store";
import { countDocuments } from "@/lib/content/documents-store";
import { countGalleryItems } from "@/lib/content/gallery-store";
import { formatAdminDateTime, todayIsoDate } from "@/lib/news-dates";
import { listAllNews } from "@/lib/news-store";

type Stat = { label: string; value: string; detail?: string; href: string };

async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    console.error("Dashboard statistic failed:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await requireActiveUser();
  const today = todayIsoDate();

  const [news, announcements, documents, photos, users, activity] = await Promise.all([
    settle(listAllNews()),
    settle(listAnnouncements()),
    settle(countDocuments()),
    settle(countGalleryItems()),
    session.role === "admin" ? settle(listUsers()) : Promise.resolve(null),
    settle(listAuditEntries(8)),
  ]);

  const stats: Stat[] = [
    {
      label: "News & Events",
      value: news ? String(news.filter((item) => item.status === "published").length) : "–",
      detail: news ? `${news.filter((item) => item.status === "draft").length} draft${news && news.filter((item) => item.status === "draft").length === 1 ? "" : "s"}` : "unavailable",
      href: "/admin/news",
    },
    {
      label: "Announcements live",
      value: announcements ? String(announcements.filter((item) => announcementState(item, today) === "live").length) : "–",
      detail: announcements ? `${announcements.length} in total` : "unavailable",
      href: "/admin/announcements",
    },
    { label: "Documents", value: documents === null ? "–" : String(documents), href: "/admin/documents" },
    { label: "Gallery photos", value: photos === null ? "–" : String(photos), href: "/admin/gallery" },
  ];
  if (session.role === "admin") {
    stats.push({
      label: "Staff accounts",
      value: users ? String(users.filter((user) => user.active).length) : "–",
      detail: users ? `${users.filter((user) => user.role === "admin" && user.active).length} administrator(s)` : "unavailable",
      href: "/admin/users",
    });
  }

  const unavailable = news === null || announcements === null || documents === null || photos === null;

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Welcome, {session.name.split(" ")[0]}</h1>
          <p className="admMuted">What is on the website right now, and the quickest ways to change it.</p>
        </div>
        <a className="admBtn admBtnGhost" href="/en" target="_blank" rel="noreferrer">
          Open website
        </a>
      </header>

      {unavailable ? (
        <p className="admAlert admAlertError" role="alert">
          Some figures could not be loaded because the database is not reachable.
        </p>
      ) : null}

      <div className="admStatGrid">
        {stats.map((stat) => (
          <Link href={stat.href} className="admStat" key={stat.label}>
            <span className="admStatValue">{stat.value}</span>
            <span className="admStatLabel">{stat.label}</span>
            {stat.detail ? <span className="admStatDetail">{stat.detail}</span> : null}
          </Link>
        ))}
      </div>

      <section className="admCard">
        <h2 className="admCardTitle">Quick actions</h2>
        <div className="admQuickActions">
          <Link href="/admin/news/new" className="admBtn admBtnPrimary">
            + New news item
          </Link>
          <Link href="/admin/announcements/new" className="admBtn">
            + New announcement
          </Link>
          <Link href="/admin/documents/new" className="admBtn">
            + Add document
          </Link>
          <Link href="/admin/gallery/new" className="admBtn">
            + Add photo
          </Link>
          <Link href="/admin/banners" className="admBtn">
            Edit home banners
          </Link>
          <Link href="/admin/pages/settings" className="admBtn">
            Contact details &amp; footer
          </Link>
        </div>
      </section>

      <section className="admCard admTableWrap">
        <div className="admCardHeader">
          <h2 className="admCardTitle">Recent activity</h2>
          <p className="admMuted">
            The latest changes by everyone. <Link href="/admin/account">See more</Link>
          </p>
        </div>
        {activity === null ? (
          <p className="admMuted admAlertInset">Activity could not be loaded.</p>
        ) : activity.length === 0 ? (
          <p className="admMuted admAlertInset">Nothing yet.</p>
        ) : (
          <table className="admTable">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((entry: AuditRecord) => (
                <tr key={entry.id}>
                  <td className="admNowrap admMuted">{formatAdminDateTime(entry.at)}</td>
                  <td>{entry.userEmail}</td>
                  <td>{describeAuditAction(entry.action)}</td>
                  <td className="admMuted admBreak">{entry.summary ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
