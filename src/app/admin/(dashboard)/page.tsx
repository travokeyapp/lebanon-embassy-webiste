import Link from "next/link";
import { describeAuditAction, listAuditEntries, type AuditRecord } from "@/lib/audit";
import { canAccess, type Area } from "@/lib/auth/permissions";
import { requireActiveUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";
import { announcementState } from "@/lib/content/announcements-schema";
import { listAnnouncements } from "@/lib/content/announcements-store";
import { countDocuments } from "@/lib/content/documents-store";
import { countGalleryItems } from "@/lib/content/gallery-store";
import { formatAdminDateTime, todayIsoDate } from "@/lib/news-dates";
import { listAllNews } from "@/lib/news-store";

type Stat = { label: string; value: string; detail?: string; href: string; area?: Area };

async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    console.error("Dashboard statistic failed:", error);
    return null;
  }
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string | string[] }> }) {
  const session = await requireActiveUser();
  const query = await searchParams;
  const denied = (Array.isArray(query.denied) ? query.denied[0] : query.denied) === "1";
  const today = todayIsoDate();
  const allowed = (area: Area) => canAccess(session, area);

  const [news, announcements, documents, photos, users, activity] = await Promise.all([
    allowed("news") ? settle(listAllNews()) : Promise.resolve(null),
    allowed("announcements") ? settle(listAnnouncements()) : Promise.resolve(null),
    allowed("documents") ? settle(countDocuments()) : Promise.resolve(null),
    allowed("gallery") ? settle(countGalleryItems()) : Promise.resolve(null),
    session.role === "admin" ? settle(listUsers()) : Promise.resolve(null),
    settle(listAuditEntries(8)),
  ]);

  const allStats: Stat[] = [
    {
      label: "News & Events",
      value: news ? String(news.filter((item) => item.status === "published").length) : "–",
      detail: news ? `${news.filter((item) => item.status === "draft").length} draft${news && news.filter((item) => item.status === "draft").length === 1 ? "" : "s"}` : "unavailable",
      href: "/admin/news",
      area: "news",
    },
    {
      label: "Announcements live",
      value: announcements ? String(announcements.filter((item) => announcementState(item, today) === "live").length) : "–",
      detail: announcements ? `${announcements.length} in total` : "unavailable",
      href: "/admin/announcements",
      area: "announcements",
    },
    { label: "Documents", value: documents === null ? "–" : String(documents), href: "/admin/documents", area: "documents" },
    { label: "Gallery photos", value: photos === null ? "–" : String(photos), href: "/admin/gallery", area: "gallery" },
  ];
  const stats = allStats.filter((stat) => !stat.area || allowed(stat.area));
  if (session.role === "admin") {
    stats.push({
      label: "Staff accounts",
      value: users ? String(users.filter((user) => user.active).length) : "–",
      detail: users ? `${users.filter((user) => user.role === "admin" && user.active).length} administrator(s)` : "unavailable",
      href: "/admin/users",
    });
  }

  const unavailable =
    (allowed("news") && news === null) ||
    (allowed("announcements") && announcements === null) ||
    (allowed("documents") && documents === null) ||
    (allowed("gallery") && photos === null);

  type QuickAction = { href: string; label: string; primary?: boolean; area: Area };
  const allQuickActions: QuickAction[] = [
    { href: "/admin/news/new", label: "+ New news item", primary: true, area: "news" },
    { href: "/admin/announcements/new", label: "+ New announcement", area: "announcements" },
    { href: "/admin/documents/new", label: "+ Add document", area: "documents" },
    { href: "/admin/gallery/new", label: "+ Add photo", area: "gallery" },
    { href: "/admin/banners", label: "Edit home banners", area: "banners" },
    { href: "/admin/pages/settings", label: "Contact details & footer", area: "settings" },
  ];
  const quickActions = allQuickActions.filter((action) => allowed(action.area));

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

      {denied ? (
        <p className="admAlert admAlertError" role="alert">
          You do not have access to that section. Ask an administrator if you need it.
        </p>
      ) : null}

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

      {quickActions.length > 0 ? (
        <section className="admCard">
          <h2 className="admCardTitle">Quick actions</h2>
          <div className="admQuickActions">
            {quickActions.map((action) => (
              <Link href={action.href} className={`admBtn${action.primary ? " admBtnPrimary" : ""}`} key={action.href}>
                {action.label}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <p className="admAlert admAlertInfo" role="status">
          Your account cannot change any section yet. Ask an administrator to grant permissions under Staff accounts.
        </p>
      )}

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
