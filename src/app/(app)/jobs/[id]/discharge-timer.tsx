"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Fitting, FittingTestResult } from "@/generated/prisma/client";
import {
  finishDischargeTestAction,
  pauseDischargeTestAction,
  resumeDischargeTestAction,
  setQuickDischargeResultAction,
} from "@/lib/actions/discharge-test";
import { DISCHARGE_DURATION_SECONDS } from "@/lib/discharge-test-constants";
import { Badge, Button, Card } from "@/components/ui";
import { FittingQuickList, type QuickStatus } from "./fitting-quick-list";

function remainingSecondsFor(runningSince: Date | null, elapsedSeconds: number) {
  const liveElapsed = runningSince ? Math.floor((Date.now() - runningSince.getTime()) / 1000) : 0;
  return Math.max(0, DISCHARGE_DURATION_SECONDS - elapsedSeconds - liveElapsed);
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function DischargeTimer({
  jobId,
  runningSince,
  elapsedSeconds,
  fittings,
  results,
}: {
  jobId: string;
  runningSince: Date | null;
  elapsedSeconds: number;
  fittings: Fitting[];
  results: FittingTestResult[];
}) {
  const [pending, startTransition] = useTransition();
  // A tick counter that forces a re-render each second while running, so
  // `remaining` (derived below, not stored in state) stays live.
  const [, setTick] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    if (!runningSince) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [runningSince, elapsedSeconds]);

  const remaining = remainingSecondsFor(runningSince, elapsedSeconds);

  useEffect(() => {
    if (runningSince && remaining <= 0 && !finishedRef.current) {
      finishedRef.current = true;
      startTransition(() => finishDischargeTestAction(jobId));
    }
  }, [remaining, runningSince, jobId, startTransition]);

  const resultByFitting = new Map(results.map((r) => [r.fittingId, r]));
  const testedCount = fittings.filter((f) => resultByFitting.get(f.id)?.durationTestPass != null).length;
  const failCount = fittings.filter((f) => resultByFitting.get(f.id)?.durationTestPass === false).length;
  const isRunning = !!runningSince;

  const statusFor = (fittingId: string): QuickStatus => {
    const v = resultByFitting.get(fittingId)?.durationTestPass;
    if (v === true) return "pass";
    if (v === false) return "fail";
    return "pending";
  };

  return (
    <div>
      <Card className="mb-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Step 2 — 90-minute discharge test</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tick each fitting off as it holds (or fails) for the duration of the test.
            </p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold tabular-nums ${isRunning ? "text-slate-900" : "text-amber-600"}`}>
              {formatClock(remaining)}
            </p>
            <p className="text-xs text-slate-400">{isRunning ? "running" : "paused"}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge color="slate">
            {testedCount}/{fittings.length} ticked
          </Badge>
          {failCount > 0 && <Badge color="red">{failCount} failed so far</Badge>}
        </div>

        <div className="mt-4 flex gap-2">
          {isRunning ? (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => startTransition(() => pauseDischargeTestAction(jobId))}
            >
              Pause
            </Button>
          ) : (
            <Button disabled={pending} onClick={() => startTransition(() => resumeDischargeTestAction(jobId))}>
              Resume
            </Button>
          )}
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (confirm("End the discharge test now and move to the review summary?")) {
                startTransition(() => finishDischargeTestAction(jobId));
              }
            }}
          >
            End test now
          </Button>
        </div>
      </Card>

      {fittings.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">No fittings to test at this site.</Card>
      ) : (
        <FittingQuickList
          fittings={fittings}
          statusFor={statusFor}
          passLabel="Held (pass)"
          failLabel="Failed"
          onPass={(fittingId) => startTransition(() => setQuickDischargeResultAction(jobId, fittingId, true))}
          onFail={(fittingId) => startTransition(() => setQuickDischargeResultAction(jobId, fittingId, false))}
        />
      )}
    </div>
  );
}
