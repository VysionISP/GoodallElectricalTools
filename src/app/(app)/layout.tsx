import type { ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SidebarLinks, BottomNavLinks, type NavItem } from "@/components/nav-links";
import { DemoBanner } from "@/components/demo-banner";
import { logoutAction } from "@/lib/actions/auth";
import {
  BuildingIcon,
  ClipboardIcon,
  HomeIcon,
  LogoutIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <HomeIcon /> },
  { href: "/customers", label: "Customers", icon: <UsersIcon /> },
  { href: "/sites", label: "Sites", icon: <BuildingIcon /> },
  { href: "/jobs", label: "Test runs", icon: <ClipboardIcon /> },
  { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

const PLATFORM_NAV_ITEM: NavItem = { href: "/admin", label: "Platform", icon: <ShieldIcon /> };

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const navItems = session.user.isPlatformAdmin ? [...NAV_ITEMS, PLATFORM_NAV_ITEM] : NAV_ITEMS;
  const business = await prisma.business.findUnique({
    where: { id: session.user.businessId },
    select: { name: true, logoPath: true, onboardedAt: true, demoData: true },
  });

  // New businesses finish the setup wizard before using the app.
  if (business && !business.onboardedAt) redirect("/onboarding");

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <aside className="hidden md:flex md:w-64 md:flex-col md:bg-brand-950">
        <div className="flex items-center gap-2.5 px-5 py-6">
          {business?.logoPath ? (
            <Image
              src={business.logoPath}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain bg-white"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm">
              {(business?.name ?? "VR").slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="truncate text-base font-semibold text-white">
            {business?.name ?? "VoltRecord"}
          </p>
        </div>

        <div className="flex-1 px-3">
          <SidebarLinks items={navItems} />
        </div>

        <div className="mx-3 mb-4 rounded-xl bg-brand-900 p-4">
          <p className="text-sm font-medium text-white">Need a hand?</p>
          <p className="mt-1 text-xs text-brand-100/70">
            Add customers, sites and fittings, then start a test run.
          </p>
        </div>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
              {(session.user.name ?? session.user.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
              <p className="truncate text-xs text-brand-100/60 capitalize">
                {session.user.role.toLowerCase()}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-md text-brand-100/70 hover:bg-white/10 hover:text-white"
              >
                <LogoutIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
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
              <div className="h-7 w-7 rounded-md bg-brand-700 text-white flex items-center justify-center font-bold text-xs">
                {(business?.name ?? "VR").slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-900 truncate max-w-[50vw]">
              {business?.name ?? "VoltRecord"}
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

        {business?.demoData && <DemoBanner />}

        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-10 md:hidden">
          <BottomNavLinks items={navItems} />
        </div>
      </div>
    </div>
  );
}
