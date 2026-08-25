import Link from "next/link";
import type { ReactNode } from "react";

// Public marketing landing page. Signed-in visitors never see this — the
// middleware routes them straight to their dashboard (or the platform
// console) before it renders.

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-950 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-brand-950 text-sm font-bold">
            FC
          </div>
          <span className="text-sm font-semibold">Field Compliance</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-brand-100/80 hover:text-white">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-brand-400"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-12 text-center md:pt-20">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Electrical testing &amp; compliance reports, done on site.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100/70">
          Run exit &amp; emergency lighting and RCD testing from your phone — guided 90-minute
          discharge tests, site fitting registers with photos, and clean branded PDF reports your
          customers can act on.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-brand-950 hover:bg-brand-400 sm:w-auto"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/5 sm:w-auto"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-sm text-brand-100/50">
          Set up in minutes. Explore with demo data before adding a single customer.
        </p>
      </section>

      <section className="bg-slate-50 px-4 py-16 text-slate-900 md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-center text-2xl font-bold">Built for the way testing actually happens</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature title="Guided 90-minute discharge tests">
              Walk through the energised check, run a pausable 90-minute timer, tick fittings off as
              they hold or fail, and confirm results before the job completes.
            </Feature>
            <Feature title="Site fitting registers">
              Every exit sign, emergency light and RCD on record per site — with location photos, brand
              &amp; model from a shared device catalogue, and install dates.
            </Feature>
            <Feature title="RCD trip testing">
              Push-button and trip-time tests against each RCD, with pass/fail limits captured per
              visit.
            </Feature>
            <Feature title="Branded PDF reports">
              Your logo, licence number and layout on every report. Configurable templates, assignable
              per customer.
            </Feature>
            <Feature title="Works required, spelled out">
              Failed fittings surface with their exact brand and model, before/after photos and repair
              notes — so quoting replacements is a copy-paste job.
            </Feature>
            <Feature title="Your whole team">
              Owner, admin and technician roles per business. Everyone works from the same customer,
              site and job history.
            </Feature>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h2 className="text-2xl font-bold">From new customer to delivered report</h2>
          <div className="mt-8 grid gap-6 text-left sm:grid-cols-3">
            <Step n={1} title="Set up the site">
              Add the customer, their site, and register every fitting with a photo — naming
              suggestions included.
            </Step>
            <Step n={2} title="Run the test">
              Start a test run on your phone. The guided flow keeps the walkthrough, the timer and the
              tick-offs in order.
            </Step>
            <Step n={3} title="Send the report">
              One tap generates the branded PDF — results, works required and photos, ready for the
              customer.
            </Step>
          </div>
          <Link
            href="/signup"
            className="mt-10 inline-block rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-brand-950 hover:bg-brand-400"
          >
            Get started
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-brand-100/50 md:px-8">
        Field Compliance — self-hosted electrical testing &amp; compliance reporting.
      </footer>
    </div>
  );
}

function Feature({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500">{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-brand-950">
        {n}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-brand-100/60">{children}</p>
    </div>
  );
}
