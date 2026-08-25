"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function isActive(pathname: string, href: string) {
  // Section-root links ("/", the console's "/admin") match exactly, so they
  // don't stay highlighted while a sibling nav item's deeper page is open.
  if (href === "/" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-800 text-white"
                : "text-brand-100/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="h-5 w-5">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
};

export function BottomNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const shown = items.slice(0, 7);
  return (
    <nav
      className={`grid border-t border-slate-200 bg-white ${GRID_COLS[shown.length] ?? "grid-cols-5"}`}
    >
      {shown.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-brand-700" : "text-slate-500"
            }`}
          >
            <span className="h-5 w-5">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
