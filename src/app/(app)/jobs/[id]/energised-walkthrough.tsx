"use client";

import { useTransition } from "react";
import type { Fitting, FittingTestResult } from "@/generated/prisma/client";
import { setEnergisedAction, startDischargeTestAction } from "@/lib/actions/discharge-test";
import { Badge, Button, Card } from "@/components/ui";
import { FittingQuickList, type QuickStatus } from "./fitting-quick-list";

export function EnergisedWalkthrough({
  jobId,
  fittings,
  results,
}: {
  jobId: string;
  fittings: Fitting[];
  results: FittingTestResult[];
}) {
  const [pending, startTransition] = useTransition();
  const resultByFitting = new Map(results.map((r) => [r.fittingId, r]));
  const checkedCount = fittings.filter((f) => resultByFitting.get(f.id)?.energisedPass != null).length;
  const notEnergisedCount = fittings.filter((f) => resultByFitting.get(f.id)?.energisedPass === false).length;
  const allChecked = fittings.length > 0 && checkedCount === fittings.length;

  const statusFor = (fittingId: string): QuickStatus => {
    const v = resultByFitting.get(fittingId)?.energisedPass;
    if (v === true) return "pass";
    if (v === false) return "fail";
    return "pending";
  };

  return (
    <div>
      <Card className="mb-4 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Step 1 — Walk-through check</h2>
        <p className="mt-1 text-sm text-slate-500">
          Confirm every fitting is energised (illuminated) before starting the 90-minute discharge
          test.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Badge color={allChecked ? "green" : "slate"}>
            {checkedCount}/{fittings.length} checked
          </Badge>
          {notEnergisedCount > 0 && <Badge color="red">{notEnergisedCount} not energised</Badge>}
        </div>
      </Card>

      {fittings.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          This site has no fittings recorded yet. Add fittings from the site page first.
        </Card>
      ) : (
        <>
          <FittingQuickList
            fittings={fittings}
            statusFor={statusFor}
            passLabel="Energised"
            failLabel="Not energised"
            onPass={(fittingId) => startTransition(() => setEnergisedAction(jobId, fittingId, true))}
            onFail={(fittingId) => startTransition(() => setEnergisedAction(jobId, fittingId, false))}
          />

          <div className="sticky bottom-20 mt-4 md:bottom-4">
            <Button
              className="w-full justify-center py-3"
              disabled={pending}
              onClick={() => startTransition(() => startDischargeTestAction(jobId))}
            >
              {allChecked
                ? "Start 90-minute discharge test"
                : `Start 90-minute discharge test (${fittings.length - checkedCount} not yet checked)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
