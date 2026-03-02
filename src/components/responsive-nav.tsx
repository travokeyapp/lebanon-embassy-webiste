"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  key: string;
  href: string;
  label: string;
};

export default function ResponsiveNav({
  navItems,
  activeNav,
  menuLabel,
}: {
  navItems: NavItem[];
  activeNav?: string;
  menuLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !navRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="container navRow" ref={navRef}>
      <button
        type="button"
        className={`menuToggleBtn${isOpen ? " isOpen" : ""}`}
        aria-label={menuLabel}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="menuToggleIcon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="menuToggleText">{menuLabel}</span>
      </button>

      <div className={`menuPanel${isOpen ? " isOpen" : ""}`}>
        <ul className="navLinks" id={menuId}>
          {navItems.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className={item.key === activeNav ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
