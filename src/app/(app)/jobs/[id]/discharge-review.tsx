"use client";

import { useTransition } from "react";
import type { Fitting, FittingTestResult } from "@/generated/prisma/client";
import { confirmDischargeReviewAction, reopenDischargeReviewAction } from "@/lib/actions/discharge-test";
import { Badge, Button, Card } from "@/components/ui";
import { TestChecklist } from "./test-checklist";

export function DischargeReview({
  jobId,
  fittings,
  results,
  done,
}: {
  jobId: string;
  fittings: Fitting[];
  results: FittingTestResult[];
  done: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const resultByFitting = new Map(results.map((r) => [r.fittingId, r]));

  // A result row can exist purely from the energised pre-check (before any
  // discharge testing), so "tested" means the discharge result was actually
  // recorded, not just that a row exists.
  const tested = fittings.filter((f) => resultByFitting.get(f.id)?.durationTestPass != null);
  const passCount = tested.filter((f) => resultByFitting.get(f.id)!.overallResult === "PASS").length;
  const failCount = tested.filter((f) => resultByFitting.get(f.id)!.overallResult !== "PASS").length;
  const untested = fittings.length - tested.length;
  const failedFittings = fittings.filter(
    (f) => resultByFitting.get(f.id)?.durationTestPass != null && resultByFitting.get(f.id)?.overallResult === "FAIL"
  );

  return (
    <div>
      <Card className="mb-4 p-4">
        <h2 className="text-sm font-semibold text-slate-900">
          {done ? "Discharge test complete" : "Step 3 — Review & confirm"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {done
            ? "This test has been confirmed and the job marked complete."
            : "The 90-minute test has ended. Confirm the fittings below are correctly marked as failed before completing the job."}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge color="green">{passCount} passed</Badge>
          {failCount > 0 && <Badge color="red">{failCount} failed</Badge>}
          {untested > 0 && <Badge color="slate">{untested} not tested</Badge>}
        </div>

        {failedFittings.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase text-slate-400">Failed fittings</p>
            <ul className="space-y-1">
              {failedFittings.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
                  <span className="font-medium text-red-900">
                    {f.reference} — {f.location}
                  </span>
                  <Badge color="red">Fail</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!done ? (
          <Button
            className="mt-4 w-full justify-center py-3"
            disabled={pending}
            onClick={() => startTransition(() => confirmDischargeReviewAction(jobId))}
          >
            Confirm results & complete job
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="mt-4"
            disabled={pending}
            onClick={() => startTransition(() => reopenDischargeReviewAction(jobId))}
          >
            Reopen for edits
          </Button>
        )}
      </Card>

      <p className="mb-2 text-xs text-slate-500">
        Tap any fitting below to adjust its result, add repair notes, or attach before/after photos.
      </p>
      <TestChecklist jobId={jobId} fittings={fittings} results={results} />
    </div>
  );
}
