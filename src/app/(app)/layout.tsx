import type { ReactNode } from "react";
import Image from "next/image";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SidebarLinks, BottomNavLinks, type NavItem } from "@/components/nav-links";
import { logoutAction } from "@/lib/actions/auth";
import {
  BuildingIcon,
  ClipboardIcon,
  HomeIcon,
  LogoutIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/icons";

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/customers", label: "Customers", icon: <UsersIcon /> },
  { href: "/sites", label: "Sites", icon: <BuildingIcon /> },
  { href: "/jobs", label: "Jobs", icon: <ClipboardIcon /> },
  { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const business = await prisma.business.findUnique({
    where: { id: session.user.businessId },
    select: { name: true, logoPath: true },
  });

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          {business?.logoPath ? (
            <Image
              src={business.logoPath}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain border border-slate-100"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
              {(business?.name ?? "FC").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {business?.name ?? "Your business"}
            </p>
            <p className="text-xs text-slate-400">Field Compliance</p>
          </div>
        </div>
        <div className="flex-1 px-3 py-4">
          <SidebarLinks items={NAV_ITEMS} />
        </div>
        <div className="border-t border-slate-100 px-3 py-4">
          <p className="truncate px-3 text-xs text-slate-400 mb-2">{session.user.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogoutIcon className="h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            {business?.logoPath ? (
              <Image
                src={business.logoPath}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-md object-contain border border-slate-100"
              />
            ) : (
              <div className="h-7 w-7 rounded-md bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                {(business?.name ?? "FC").slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-900 truncate max-w-[50vw]">
              {business?.name ?? "Field Compliance"}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </form>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-10 md:hidden">
          <BottomNavLinks items={NAV_ITEMS} />
        </div>
      </div>
    </div>
  );
}
