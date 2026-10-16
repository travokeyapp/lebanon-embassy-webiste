import Image from "next/image";
import { requireSession } from "@/lib/auth/session";
import AdminNav from "./admin-nav";
import { logoutAction } from "./actions";

// Every admin page depends on the session cookie and live data; never prerender.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <div className="admShell">
      <aside className="admSidebar">
        <div className="admBrand">
          <Image src="/cedar-logo.svg" alt="" width={40} height={40} />
          <div>
            <strong>Embassy of Lebanon</strong>
            <span>Website admin</span>
          </div>
        </div>
        <AdminNav />
        <div className="admSidebarFooter">
          <div className="admUser">
            <strong>{session.name}</strong>
            <span>{session.email}</span>
          </div>
          <form action={logoutAction}>
            <button className="admBtn admBtnGhost admBtnSmall" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="admMain">{children}</main>
    </div>
  );
}
