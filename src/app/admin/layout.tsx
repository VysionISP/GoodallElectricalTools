import type { ReactNode } from "react";
import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/session";
import { SidebarLinks, BottomNavLinks, type NavItem } from "@/components/nav-links";
import { logoutAction } from "@/lib/actions/auth";
import {
  BuildingIcon,
  ClipboardIcon,
  HomeIcon,
  LogoutIcon,
  ShieldIcon,
} from "@/components/icons";

// The platform console is deliberately its own surface, separate from the
// tenant-facing app: different chrome, different nav, platform-wide data.
const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <HomeIcon /> },
  { href: "/admin/businesses", label: "Businesses", icon: <BuildingIcon /> },
  { href: "/admin/catalog", label: "Catalogue", icon: <ClipboardIcon /> },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requirePlatformAdmin();

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      <aside className="hidden md:flex md:w-64 md:flex-col md:bg-slate-950">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-slate-950">
            <ShieldIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Platform console</p>
            <p className="text-[11px] text-slate-400">Field Compliance</p>
          </div>
        </div>

        <div className="flex-1 px-3">
          <SidebarLinks items={NAV_ITEMS} />
        </div>

        <div className="mx-3 mb-4">
          <Link
            href="/"
            className="block rounded-xl bg-slate-900 p-4 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            ← Open the app
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Switch to your own business&apos;s workspace.
            </span>
          </Link>
        </div>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
              {(session.user.name ?? session.user.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
              <p className="truncate text-xs text-slate-400">Platform admin</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <LogoutIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-slate-950">
              <ShieldIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-white">Platform console</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Open the app
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-10 md:hidden">
          <BottomNavLinks items={NAV_ITEMS} />
        </div>
      </div>
    </div>
  );
}
