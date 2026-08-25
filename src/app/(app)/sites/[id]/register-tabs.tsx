"use client";

import { useState } from "react";
import type { Fitting, FittingModel, RcdUnit } from "@/generated/prisma/client";
import { FittingsManager } from "./fittings-manager";
import { RcdUnitsManager } from "./rcd-units-manager";

export function RegisterTabs({
  siteId,
  fittings,
  rcdUnits,
}: {
  siteId: string;
  fittings: (Fitting & { model: FittingModel | null })[];
  rcdUnits: RcdUnit[];
}) {
  const [tab, setTab] = useState<"EXIT_EMERGENCY_LIGHTING" | "RCD_TESTING">(
    "EXIT_EMERGENCY_LIGHTING"
  );

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          onClick={() => setTab("EXIT_EMERGENCY_LIGHTING")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "EXIT_EMERGENCY_LIGHTING"
              ? "bg-brand-100 text-brand-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Exit & Emergency Lighting
        </button>
        <button
          onClick={() => setTab("RCD_TESTING")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "RCD_TESTING" ? "bg-brand-100 text-brand-800" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          RCD / Safety Switches
        </button>
      </div>

      {tab === "EXIT_EMERGENCY_LIGHTING" ? (
        <FittingsManager siteId={siteId} fittings={fittings} />
      ) : (
        <RcdUnitsManager siteId={siteId} rcdUnits={rcdUnits} />
      )}
    </div>
  );
}
