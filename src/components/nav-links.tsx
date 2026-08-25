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
  if (href === "/") return pathname === "/";
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
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

export function BottomNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="grid grid-cols-5 border-t border-slate-200 bg-white">
      {items.slice(0, 5).map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-blue-700" : "text-slate-500"
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
