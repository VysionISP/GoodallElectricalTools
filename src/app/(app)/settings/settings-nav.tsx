"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/settings", label: "Business" },
  { href: "/settings/templates", label: "Report templates" },
  { href: "/settings/catalog", label: "Device catalogue" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-slate-200">
      <nav className="-mb-px flex gap-5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/settings" ? pathname === "/settings" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-1 pb-2.5 text-sm font-medium ${
                active
                  ? "border-brand-700 text-brand-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
