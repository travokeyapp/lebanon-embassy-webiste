import { requireAdmin } from "@/lib/auth/session";
import { listUsers, type UserRecord } from "@/lib/auth/users";
import { formatAdminDateTime } from "@/lib/news-dates";
import CreateUserForm from "./create-user-form";
import UserRowActions from "./user-row-actions";

export default async function UsersPage() {
  const session = await requireAdmin();

  let users: UserRecord[] = [];
  let loadError: string | null = null;
  try {
    users = await listUsers();
  } catch (error) {
    console.error("Loading users failed:", error);
    loadError = "Could not load staff accounts from the database.";
  }

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Staff accounts</h1>
          <p className="admMuted">
            Editors manage website content. Administrators can also add and remove staff.
          </p>
        </div>
      </header>

      <CreateUserForm />

      {loadError ? (
        <p className="admAlert admAlertError" role="alert">
          {loadError}
        </p>
      ) : (
        <section className="admCard admTableWrap">
          <table className="admTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th className="admColActions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={user.active ? "" : "admRowInactive"}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td className="admBreak">{user.email}</td>
                  <td>
                    <span className={`admBadge admBadge-${user.role}`}>
                      {user.role === "admin" ? "Administrator" : "Editor"}
                    </span>
                  </td>
                  <td>
                    <span className={`admBadge ${user.active ? "admBadge-published" : "admBadge-inactive"}`}>
                      {user.active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="admNowrap admMuted">{user.lastLoginAt ? formatAdminDateTime(user.lastLoginAt) : "Never"}</td>
                  <td className="admColActions">
                    <UserRowActions user={user} isSelf={user.id === session.id} />
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
