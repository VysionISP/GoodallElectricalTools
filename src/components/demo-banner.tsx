"use client";

import { useTransition } from "react";
import { clearDemoDataAction } from "@/lib/actions/onboarding";

export function DemoBanner() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900 md:px-8">
      <p>
        <span className="font-semibold">You&apos;re looking at demo data.</span> Explore the
        customer, site, fittings and finished tests — none of it is real.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Clear all demo data? Your business settings are kept.")) {
            startTransition(() => clearDemoDataAction());
          }
        }}
        className="rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-amber-800 disabled:opacity-60"
      >
        {pending ? "Clearing..." : "Done looking around? Clear demo data & get started"}
      </button>
    </div>
  );
}
