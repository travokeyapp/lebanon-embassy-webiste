"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccess, type Area, type AreaGrant } from "@/lib/auth/permissions";

type NavItem = { href: string; label: string; adminOnly?: boolean; exact?: boolean; area?: Area };
type NavGroup = { title: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    title: "Content",
    items: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/news", label: "News & Events", area: "news" },
      { href: "/admin/announcements", label: "Announcements", area: "announcements" },
      { href: "/admin/banners", label: "Home banners", area: "banners" },
      { href: "/admin/documents", label: "Documents & forms", area: "documents" },
      { href: "/admin/gallery", label: "Gallery", area: "gallery" },
    ],
  },
  {
    title: "Pages",
    items: [
      { href: "/admin/pages/services", label: "Services", area: "pages" },
      { href: "/admin/pages/consular", label: "Consular", area: "pages" },
      { href: "/admin/pages/visas", label: "Visas", area: "pages" },
      { href: "/admin/pages/ambassador", label: "The Ambassador", area: "pages" },
      { href: "/admin/pages/relations", label: "Relations", area: "pages" },
      { href: "/admin/pages/about", label: "About", area: "pages" },
      { href: "/admin/pages/settings", label: "Contact & footer", area: "settings" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/admin/users", label: "Staff accounts", adminOnly: true },
      { href: "/admin/account", label: "My account" },
    ],
  },
];

export default function AdminNav({ role, areas }: { role: "admin" | "editor"; areas: AreaGrant }) {
  const pathname = usePathname();
  const user = { role, areas };

  return (
    <nav className="admNav" aria-label="Admin sections">
      {GROUPS.map((group) => {
        const items = group.items.filter(
          (item) => (!item.adminOnly || role === "admin") && (!item.area || canAccess(user, item.area)),
        );
        if (items.length === 0) {
          return null;
        }
        return (
          <div className="admNavGroup" key={group.title}>
            <div className="admNavGroupTitle">{group.title}</div>
            {items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "admNavLink isActive" : "admNavLink"}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
      <a className="admNavLink admNavLinkMuted" href="/en" target="_blank" rel="noreferrer">
        Open website
      </a>
    </nav>
  );
}
