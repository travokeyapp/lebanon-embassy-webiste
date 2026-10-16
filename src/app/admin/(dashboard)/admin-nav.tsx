"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; adminOnly?: boolean; exact?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    title: "Content",
    items: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/news", label: "News & Events" },
      { href: "/admin/announcements", label: "Announcements" },
      { href: "/admin/banners", label: "Home banners" },
      { href: "/admin/documents", label: "Documents & forms" },
      { href: "/admin/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Pages",
    items: [
      { href: "/admin/pages/services", label: "Services" },
      { href: "/admin/pages/consular", label: "Consular" },
      { href: "/admin/pages/visas", label: "Visas" },
      { href: "/admin/pages/ambassador", label: "The Ambassador" },
      { href: "/admin/pages/relations", label: "Relations" },
      { href: "/admin/pages/about", label: "About" },
      { href: "/admin/pages/settings", label: "Contact & footer" },
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

export default function AdminNav({ role }: { role: "admin" | "editor" }) {
  const pathname = usePathname();

  return (
    <nav className="admNav" aria-label="Admin sections">
      {GROUPS.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || role === "admin");
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
