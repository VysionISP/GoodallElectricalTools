"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "@/components/icons";

// Pricing block on the landing page. Client component purely for the
// monthly/annual billing toggle; annual is two months free, shown as the
// effective per-month price with the yearly total underneath.

type Billing = "monthly" | "annual";

const PLANS = [
  {
    name: "Solo",
    blurb: "One tester, the whole toolkit.",
    seats: "1 user",
    monthly: 49,
    highlighted: false,
    points: [
      "Unlimited customers, sites & fittings",
      "Guided discharge & RCD testing",
      "Branded PDF reports",
      "Device photo catalogue",
    ],
  },
  {
    name: "Team",
    blurb: "The office plus techs in the field.",
    seats: "Up to 5 users",
    monthly: 119,
    highlighted: true,
    points: [
      "Everything in Solo",
      "Owner, admin & technician roles",
      "Report templates per customer",
      "Shared job & site history",
    ],
  },
  {
    name: "Unlimited",
    blurb: "Whole crews, no seat counting.",
    seats: "Unlimited users",
    monthly: 249,
    highlighted: false,
    points: [
      "Everything in Team",
      "Unlimited technicians",
      "Priority support",
      "Help importing existing registers",
    ],
  },
];

function annualTotal(monthly: number) {
  return monthly * 10; // two months free
}

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-600">
          Pricing
        </p>
        <h2 className="mx-auto mt-2 max-w-xl text-center text-3xl font-bold tracking-tight">
          Every feature on every plan. Pay for seats, nothing else.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-500">
          Unlimited customers, sites, test visits and PDF reports on all plans — the only difference
          is how many people are on your team.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                billing === "monthly" ? "bg-brand-700 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                billing === "annual" ? "bg-brand-700 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Annual
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  billing === "annual" ? "bg-verified text-white" : "bg-verified/10 text-verified-600"
                }`}
              >
                2 months free
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} billing={billing} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Prices in AUD, ex GST. Start with demo data and set up your business before you pay
          anything.
        </p>
      </div>
    </section>
  );
}

function PricingCard({ plan, billing }: { plan: (typeof PLANS)[number]; billing: Billing }) {
  const perMonth = billing === "monthly" ? plan.monthly : Math.round(annualTotal(plan.monthly) / 12);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
        plan.highlighted ? "border-electric shadow-lg shadow-electric/10" : "border-slate-200"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-semibold text-white">
          Most popular
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{plan.name}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{plan.blurb}</p>
      <p className="mt-4">
        <span className="text-4xl font-bold tracking-tight">${perMonth}</span>
        <span className="text-sm text-slate-400"> /month</span>
      </p>
      <p className="mt-1 h-4 text-xs text-slate-400">
        {billing === "annual" ? (
          <>
            ${annualTotal(plan.monthly)} billed yearly ·{" "}
            <span className="font-medium text-verified-600">
              save ${plan.monthly * 2}
            </span>
          </>
        ) : (
          "billed monthly"
        )}
      </p>
      <p className="mt-2 text-xs font-medium text-brand-700">{plan.seats}</p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.points.map((point) => (
          <li key={point} className="flex gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <CheckIcon className="h-2.5 w-2.5" />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`mt-6 rounded-xl py-2.5 text-center text-sm font-semibold ${
          plan.highlighted
            ? "bg-brand-700 text-white hover:bg-brand-800"
            : "border border-slate-200 text-slate-700 hover:border-electric hover:text-brand-700"
        }`}
      >
        Get started
      </Link>
    </div>
  );
}
