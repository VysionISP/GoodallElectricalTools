import type { DischargePhase, Fitting, FittingModel, FittingTestResult } from "@/generated/prisma/client";
import { EnergisedWalkthrough } from "./energised-walkthrough";
import { DischargeTimer } from "./discharge-timer";
import { DischargeReview } from "./discharge-review";

/** Routes an Exit & Emergency Lighting job to the right step of the guided
 * discharge test: energised walkthrough -> 90-min timer -> review/confirm. */
export function DischargeTestFlow({
  jobId,
  phase,
  runningSince,
  elapsedSeconds,
  fittings,
  results,
}: {
  jobId: string;
  phase: DischargePhase;
  runningSince: Date | null;
  elapsedSeconds: number;
  fittings: (Fitting & { model: FittingModel | null })[];
  results: FittingTestResult[];
}) {
  if (phase === "ENERGISED_CHECK") {
    return <EnergisedWalkthrough jobId={jobId} fittings={fittings} results={results} />;
  }
  if (phase === "DISCHARGE_TEST") {
    return (
      <DischargeTimer
        jobId={jobId}
        runningSince={runningSince}
        elapsedSeconds={elapsedSeconds}
        fittings={fittings}
        results={results}
      />
    );
  }
  return <DischargeReview jobId={jobId} fittings={fittings} results={results} done={phase === "DONE"} />;
}
