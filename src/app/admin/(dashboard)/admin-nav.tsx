"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/news", label: "News & Events" },
  { href: "/admin/account", label: "My account" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admNav" aria-label="Admin sections">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
      <a className="admNavLink admNavLinkMuted" href="/en" target="_blank" rel="noreferrer">
        Open website
      </a>
    </nav>
  );
}
