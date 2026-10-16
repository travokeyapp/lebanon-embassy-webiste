import { describeAuditAction, listAuditEntries, type AuditRecord } from "@/lib/audit";
import { requireSession } from "@/lib/auth/session";
import { formatAdminDateTime } from "@/lib/news-dates";
import PasswordForm from "./password-form";

const ACTIVITY_LIMIT = 50;

export default async function AccountPage() {
  const session = await requireSession();

  let entries: AuditRecord[] = [];
  let activityError: string | null = null;
  try {
    entries = await listAuditEntries(ACTIVITY_LIMIT);
  } catch (error) {
    console.error("Loading activity failed:", error);
    activityError = "Could not load recent activity from the database.";
  }

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>My account</h1>
          <p className="admMuted">
            Signed in as {session.name} ({session.email}), role: {session.role}.
          </p>
        </div>
      </header>

      <section className="admCard">
        <h2 className="admCardTitle">Change password</h2>
        <PasswordForm />
      </section>

      <section className="admCard admTableWrap">
        <div className="admCardHeader">
          <h2 className="admCardTitle">Recent activity</h2>
          <p className="admMuted">The last {ACTIVITY_LIMIT} actions by everyone who uses this admin.</p>
        </div>
        {activityError ? (
          <p className="admAlert admAlertError admAlertInset" role="alert">
            {activityError}
          </p>
        ) : entries.length === 0 ? (
          <p className="admMuted admAlertInset">No activity recorded yet.</p>
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
              {entries.map((entry) => (
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
