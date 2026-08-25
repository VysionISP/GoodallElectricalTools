import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

// Matches the landing page and signup wizard: full-bleed dark brand
// background with the same slim header.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-950 px-4">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between py-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/voltrecord-lockup-dark.png"
            alt="VoltRecord"
            width={150}
            height={34}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-electric-400"
        >
          Get started
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center pb-24 text-center">
        {children}
        <p className="mt-8 text-xs text-brand-100/50">
          Your business&apos;s data is private to your team — nobody else on the platform sees it.
        </p>
      </main>
    </div>
  );
}
