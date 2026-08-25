import Link from "next/link";
import type { ReactNode } from "react";
import { CheckIcon, XIcon, CameraIcon, DownloadIcon } from "@/components/icons";

// Public marketing landing page. Signed-in visitors never see this — the
// middleware routes them straight to their dashboard (or the platform
// console) before it renders. Every "screenshot" below is a hand-built
// facsimile of the real product UI, so the page stays truthful and loads
// with zero image assets.

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-950 text-white">
      <TopNav />
      <Hero />
      <FactStrip />
      <FeatureSections />
      <HowItWorks />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ---------------------------------- nav ---------------------------------- */

function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-brand-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-brand-950">
            FC
          </div>
          <span className="text-sm font-semibold tracking-tight">Field Compliance</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-brand-100/70 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-100/80 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-brand-400"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft green glow + faint grid, no image assets */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-16 text-center md:px-8 md:pt-24">
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Exit &amp; emergency lighting · RCD testing · AS/NZS 2293 workflow
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          The testing paperwork,
          <br />
          <span className="text-brand-400">done before you leave site.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-brand-100/70">
          Field Compliance runs your emergency lighting and RCD test visits from your phone — a
          guided 90-minute discharge test, a photo register of every fitting, and a branded PDF
          report generated the moment you confirm the last result.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-brand-950 shadow-lg shadow-brand-500/25 hover:bg-brand-400 sm:w-auto"
          >
            Get started — it&apos;s quick
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-white/15 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/5 sm:w-auto"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-sm text-brand-100/50">
          Explore with one-click demo data before you add a single customer.
        </p>
      </div>

      {/* hero product mock: the live discharge test screen */}
      <div className="relative mx-auto w-full max-w-4xl px-4 pb-16 md:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 bottom-8 top-16 rounded-[40px] bg-brand-500/20 blur-3xl"
        />
        <MockWindow title="Riverside Office — 6-Monthly Discharge Test">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Step 2 — 90-minute discharge test</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Tick each fitting off as it holds (or fails) for the duration of the test.
              </p>
              <div className="mt-2.5 flex gap-1.5">
                <MiniPill tone="slate">14/18 ticked</MiniPill>
                <MiniPill tone="red">1 failed so far</MiniPill>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums text-slate-900">71:22</p>
              <p className="text-[11px] text-slate-400">running</p>
              <div className="mt-2 flex justify-end gap-1.5">
                <span className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  Pause
                </span>
                <span className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  End test now
                </span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            <MockFittingRow refCode="EX-01" location="Front entry, above door" state="pass" />
            <MockFittingRow refCode="EL-02" location="Stairwell, mid landing" state="fail" />
            <MockFittingRow refCode="EL-03" location="Level 1 corridor" state="pass" />
            <MockFittingRow refCode="CB-01" location="Warehouse roller door" state="pending" />
          </div>
        </MockWindow>
      </div>
    </section>
  );
}

function MockWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white text-left shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-2 truncate text-xs text-slate-400">{title}</span>
      </div>
      {children}
    </div>
  );
}

function MockFittingRow({
  refCode,
  location,
  state,
}: {
  refCode: string;
  location: string;
  state: "pass" | "fail" | "pending";
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-300">
        <CameraIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{refCode}</p>
        <p className="truncate text-xs text-slate-500">{location}</p>
      </div>
      <div className="flex gap-1.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            state === "pass"
              ? "border-transparent bg-green-100 text-green-700"
              : "border-slate-200 text-slate-300"
          }`}
        >
          <CheckIcon className="h-4 w-4" />
        </span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            state === "fail"
              ? "border-transparent bg-red-100 text-red-700"
              : "border-slate-200 text-slate-300"
          }`}
        >
          <XIcon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function MiniPill({ tone, children }: { tone: "slate" | "red" | "green" | "amber"; children: ReactNode }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* ------------------------------- fact strip ------------------------------- */

function FactStrip() {
  const facts = [
    ["90 min", "guided, pausable discharge timer"],
    ["2 tools", "emergency lighting + RCD testing"],
    ["1 tap", "from confirmed results to branded PDF"],
    ["6-monthly", "test history kept per fitting, per site"],
  ];
  return (
    <section className="border-y border-white/5 bg-brand-900/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-8">
        {facts.map(([big, small]) => (
          <div key={small} className="text-center">
            <p className="text-2xl font-bold text-brand-400">{big}</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-100/60">{small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ feature rows ------------------------------ */

function FeatureSections() {
  return (
    <section id="features" className="bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-600">
          What&apos;s inside
        </p>
        <h2 className="mx-auto mt-2 max-w-xl text-center text-3xl font-bold tracking-tight">
          Built around how a test visit actually runs
        </h2>

        <div className="mt-16 space-y-20">
          <FeatureRow
            eyebrow="Exit & emergency lighting"
            title="A discharge test that keeps count for you"
            points={[
              "Energised walkthrough first — confirm every fitting is illuminated before you cut the power.",
              "The 90-minute timer runs on the job, not in your head. Pause it for lunch; it picks up where it left off.",
              "Tick or cross each fitting as you walk the site. Tap a photo to see exactly which fitting you're looking at.",
              "A review step totals passes, failures and anything untested — you confirm before the job completes.",
            ]}
            mock={
              <MockWindow title="Step 3 — Review & confirm">
                <div className="p-4">
                  <div className="flex gap-1.5">
                    <MiniPill tone="green">16 passed</MiniPill>
                    <MiniPill tone="red">1 failed</MiniPill>
                    <MiniPill tone="slate">1 not tested</MiniPill>
                  </div>
                  <div className="mt-3 rounded-lg bg-red-50 px-3 py-2">
                    <p className="text-xs font-semibold text-red-900">EL-02 — Stairwell, mid landing</p>
                    <p className="mt-0.5 text-[11px] text-red-700">
                      Dropped out after 35 minutes · battery at end of life
                    </p>
                  </div>
                  <div className="mt-3 rounded-lg bg-brand-700 py-2.5 text-center text-xs font-semibold text-white">
                    Confirm results &amp; complete job
                  </div>
                </div>
              </MockWindow>
            }
          />

          <FeatureRow
            flip
            eyebrow="Site registers"
            title="Every fitting on record, with a face to the name"
            points={[
              "Each site keeps a permanent register: reference, location, photo, brand & model, install date.",
              "Adding devices is a guided flow — pick the model from a photo catalogue (Clevertronics ranges seeded, extendable from the admin console).",
              "No naming convention on site? References like EX-01 and EL-02 are suggested automatically, in sequence.",
              "Upload the site's floor plan PDF and export the register as CSV or a PDF schedule any time.",
            ]}
            mock={
              <MockWindow title="Riverside Office — Fittings (18)">
                <div className="grid gap-2 p-4 sm:grid-cols-2">
                  <MockRegisterCard
                    refCode="EX-01"
                    badge="Exit sign"
                    model="Clevertronics Cleverfit PRO"
                    detail="Front entry · installed Mar 2022"
                  />
                  <MockRegisterCard
                    refCode="EL-02"
                    badge="Emergency light"
                    model="Clevertronics Lifelight Recessed"
                    detail="Stairwell · installed Mar 2022"
                  />
                </div>
              </MockWindow>
            }
          />

          <FeatureRow
            eyebrow="Reports"
            title="A report the customer can hand to anyone"
            points={[
              "Your logo, licence number and contact details on a clean A4 layout — generated in one tap, no export dance.",
              "Failed fittings appear in a works-required section with the exact brand and model to order, repair notes, and before/after photos.",
              "Layouts are templated: adjust colours, sections and columns, and assign different templates per customer.",
              "Preview any template against sample data before you save it.",
            ]}
            mock={
              <MockWindow title="riverside-office-emergency-lighting-report.pdf">
                <div className="p-4 text-[11px]">
                  <div className="flex items-center justify-between border-b-2 border-brand-700 pb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Emergency &amp; Exit Lighting Test Report</p>
                      <p className="text-[10px] text-slate-400">6-Monthly Discharge Test · AS/NZS 2293</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-700 text-[10px] font-bold text-white">
                      LOGO
                    </div>
                  </div>
                  <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
                    <MockStat n="18" label="Tested" tone="bg-slate-100 text-slate-700" />
                    <MockStat n="16" label="Pass" tone="bg-green-100 text-green-700" />
                    <MockStat n="1" label="Repair" tone="bg-amber-100 text-amber-700" />
                    <MockStat n="1" label="Fail" tone="bg-red-100 text-red-700" />
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Repairs required
                  </p>
                  <div className="mt-1 rounded border border-slate-200 p-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">EL-02 — Stairwell, mid landing</p>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        Fail
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-500">
                      Clevertronics Lifelight Recessed — battery at end of life, replace fitting.
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      <div className="flex h-10 flex-1 items-center justify-center rounded bg-slate-100 text-slate-300">
                        <CameraIcon className="h-4 w-4" />
                      </div>
                      <div className="flex h-10 flex-1 items-center justify-center rounded bg-slate-100 text-slate-300">
                        <CameraIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[11px] font-medium text-slate-600">
                    <DownloadIcon className="h-3.5 w-3.5" /> PDF report
                  </div>
                </div>
              </MockWindow>
            }
          />

          <FeatureRow
            flip
            eyebrow="RCD / safety switches"
            title="Trip times against the clock, not a clipboard"
            points={[
              "Register every RCD at the switchboard with its type and rating, same as fittings.",
              "Record push-button and trip-time results (1× and 5× rated current) per unit, per visit.",
              "Out-of-limit units land in the same works-required flow — with the location and rating already written down.",
              "6-monthly or 12-monthly cadence per job, tracked against the same customer and site history.",
            ]}
            mock={
              <MockWindow title="Riverside Office — RCD Test">
                <div className="divide-y divide-slate-100">
                  <MockRcdRow refCode="SB1-RCD1" detail="Type A · 30mA · power circuit" ms="24ms" pass />
                  <MockRcdRow refCode="SB1-RCD2" detail="Type A · 30mA · lighting circuit" ms="320ms" />
                  <MockRcdRow refCode="SB2-RCD1" detail="Type A · 30mA · kitchen circuit" ms="19ms" pass />
                </div>
              </MockWindow>
            }
          />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  eyebrow,
  title,
  points,
  mock,
  flip,
}: {
  eyebrow: string;
  title: string;
  points: string[];
  mock: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? "lg:order-2" : ""}>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight">{title}</h3>
        <ul className="mt-5 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <CheckIcon className="h-3 w-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={flip ? "lg:order-1" : ""}>{mock}</div>
    </div>
  );
}

function MockRegisterCard({
  refCode,
  badge,
  model,
  detail,
}: {
  refCode: string;
  badge: string;
  model: string;
  detail: string;
}) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-slate-200 p-2.5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-300">
        <CameraIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          {refCode}
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            {badge}
          </span>
        </p>
        <p className="truncate text-[11px] text-slate-500">{model}</p>
        <p className="truncate text-[11px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

function MockStat({ n, label, tone }: { n: string; label: string; tone: string }) {
  return (
    <div className={`rounded p-1.5 ${tone}`}>
      <p className="text-sm font-bold">{n}</p>
      <p className="text-[9px] uppercase">{label}</p>
    </div>
  );
}

function MockRcdRow({
  refCode,
  detail,
  ms,
  pass,
}: {
  refCode: string;
  detail: string;
  ms: string;
  pass?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{refCode}</p>
        <p className="truncate text-xs text-slate-500">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs tabular-nums text-slate-500">{ms} @ 1×</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {pass ? "Pass" : "Fail"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------- how it works ------------------------------ */

function HowItWorks() {
  const steps: [string, string, string][] = [
    [
      "Set up the customer",
      "Add the customer and their site. Upload the floor plan, note whether the site already has a fitting naming convention.",
      "2 minutes",
    ],
    [
      "Register the devices",
      "Walk the site once: photograph each fitting, pick its model from the catalogue, accept the suggested reference.",
      "First visit only",
    ],
    [
      "Run the test",
      "Energised check, then the guided 90-minute discharge test — or an RCD run. Tick, cross, photograph as you go.",
      "The test runs itself",
    ],
    [
      "Send the report",
      "Confirm the results and the branded PDF is ready — summary, works required, photos. Email it before you drive off.",
      "1 tap",
    ],
  ];
  return (
    <section id="how" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 100%, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-400">
          How it works
        </p>
        <h2 className="mx-auto mt-2 max-w-xl text-center text-3xl font-bold tracking-tight">
          From new customer to delivered report
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map(([title, body, tag], i) => (
            <div key={title} className="relative">
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute left-10 right-0 top-4 hidden h-px bg-gradient-to-r from-brand-500/50 to-transparent md:block"
                />
              )}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-brand-950">
                {i + 1}
              </div>
              <h3 className="mt-4 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-100/60">{body}</p>
              <p className="mt-3 inline-block rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-brand-300">
                {tag}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- faq ---------------------------------- */

function Faq() {
  const items: [string, string][] = [
    [
      "Does it work on a phone?",
      "That's where it's designed to live. The whole test flow — walkthrough, timer, tick/cross, photos straight from the camera — is built for one-handed use on site. The desktop view is there for the office: customers, templates, settings and reviewing reports.",
    ],
    [
      "Where does our data live?",
      "On your own server. Field Compliance is self-hosted: customers, sites, photos and reports stay on hardware you control, not in someone else's cloud. Back up two things (the database file and the uploads folder) and you can restore everything.",
    ],
    [
      "What does the emergency lighting workflow cover?",
      "The AS/NZS 2293 maintenance routine: an energised pre-check, the 90-minute duration (discharge) test with a pausable timer, per-fitting condition checks (illumination, battery, lamp, physical damage, signage), and 6-monthly or annual visit types with history kept per fitting.",
    ],
    [
      "Can different customers get different-looking reports?",
      "Yes. Report templates control colours, sections, columns and the text blocks around your branding — and each customer can be assigned their own template, falling back to your default.",
    ],
    [
      "How do technicians know which model a fitting is?",
      "The device catalogue shows a photo next to each brand and model when adding a fitting, so whoever's on the ladder matches what they see. It ships with the Clevertronics ranges and your admin can add any brand, with photos.",
    ],
    [
      "Can we try it without touching real data?",
      "Signup ends with a one-click demo: a sample customer, a site full of fittings and RCDs, and finished tests including a failure — so you can open a real report straight away. One button clears it all when you're done.",
    ],
  ];
  return (
    <section id="faq" className="border-t border-white/5 bg-brand-900/30">
      <div className="mx-auto w-full max-w-3xl px-4 py-20 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">Questions, answered</h2>
        <div className="mt-10 divide-y divide-white/10">
          {items.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-brand-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-brand-100/70">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- cta/footer ------------------------------ */

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-900 to-brand-950 px-6 py-14 text-center md:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 0%, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 70%)",
          }}
        />
        <h2 className="relative text-3xl font-bold tracking-tight">
          Your next test visit could end with the report already sent.
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-brand-100/70">
          Set up your business in a couple of minutes, load the demo data, and see the whole flow —
          register, test, report — before your first real job.
        </p>
        <Link
          href="/signup"
          className="relative mt-8 inline-block rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-brand-950 shadow-lg shadow-brand-500/25 hover:bg-brand-400"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-brand-100/50 sm:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-500 text-[10px] font-bold text-brand-950">
            FC
          </div>
          Field Compliance — self-hosted electrical testing &amp; compliance reporting.
        </div>
        <div className="flex gap-5">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-white">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
