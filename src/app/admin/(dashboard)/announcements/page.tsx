import Link from "next/link";
import { announcementState, type AnnouncementRecord, type AnnouncementState } from "@/lib/content/announcements-schema";
import { listAnnouncements } from "@/lib/content/announcements-store";
import { formatAdminDate, todayIsoDate } from "@/lib/news-dates";
import AnnouncementRowActions from "./row-actions";

const STATE_LABELS: Record<AnnouncementState, { label: string; badge: string }> = {
  live: { label: "On the website", badge: "admBadge-published" },
  scheduled: { label: "Scheduled", badge: "admBadge-editor" },
  expired: { label: "Expired", badge: "admBadge-inactive" },
  off: { label: "Off", badge: "admBadge-draft" },
};

function dateWindow(item: AnnouncementRecord): string {
  if (!item.startsAt && !item.endsAt) {
    return "Always";
  }
  const from = item.startsAt ? formatAdminDate(item.startsAt) : "now";
  const until = item.endsAt ? formatAdminDate(item.endsAt) : "no end";
  return `${from} to ${until}`;
}

export default async function AnnouncementsPage({ searchParams }: { searchParams: Promise<{ saved?: string | string[] }> }) {
  const query = await searchParams;
  const saved = (Array.isArray(query.saved) ? query.saved[0] : query.saved) === "1";

  let items: AnnouncementRecord[] = [];
  let loadError: string | null = null;
  try {
    items = await listAnnouncements();
  } catch (error) {
    console.error("Loading announcements failed:", error);
    loadError = "Could not load announcements from the database.";
  }
  const today = todayIsoDate();

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Announcements</h1>
          <p className="admMuted">Short notices shown in a strip under the header on every page, for closures, holidays or urgent messages.</p>
        </div>
        <Link href="/admin/announcements/new" className="admBtn admBtnPrimary">
          + New announcement
        </Link>
      </header>

      {saved ? (
        <p className="admAlert admAlertSuccess" role="status">
          Saved. Switched-on announcements within their dates are on the website now.
        </p>
      ) : null}

      {loadError ? (
        <p className="admAlert admAlertError" role="alert">
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <section className="admCard admEmpty">
          <p>No announcements yet.</p>
          <Link href="/admin/announcements/new" className="admBtn admBtnPrimary">
            Create one
          </Link>
        </section>
      ) : (
        <section className="admCard admTableWrap">
          <table className="admTable">
            <thead>
              <tr>
                <th>Text</th>
                <th>Style</th>
                <th>Dates</th>
                <th>Status</th>
                <th className="admColActions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const state = STATE_LABELS[announcementState(item, today)];
                return (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/admin/announcements/${item.id}`} className="admRowTitle">
                        {item.text.en}
                      </Link>
                      {item.text.ar ? (
                        <div className="admRowSub" dir="rtl" lang="ar">
                          {item.text.ar}
                        </div>
                      ) : null}
                    </td>
                    <td className="admNowrap">{item.tone === "alert" ? "Important" : "Information"}</td>
                    <td className="admNowrap admMuted">{dateWindow(item)}</td>
                    <td>
                      <span className={`admBadge ${state.badge}`}>{state.label}</span>
                    </td>
                    <td className="admColActions">
                      <AnnouncementRowActions id={item.id} active={item.active} text={item.text.en} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
