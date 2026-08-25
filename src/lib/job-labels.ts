import type { Job, ToolType } from "@/generated/prisma/client";

export const TOOL_LABELS: Record<ToolType, string> = {
  EXIT_EMERGENCY_LIGHTING: "Exit & Emergency Lighting",
  RCD_TESTING: "RCD / Safety Switch Testing",
};

export const TOOL_SHORT_LABELS: Record<ToolType, string> = {
  EXIT_EMERGENCY_LIGHTING: "Emergency lighting",
  RCD_TESTING: "RCD testing",
};

type JobLike = Pick<Job, "toolType" | "testType" | "rcdTestFrequency">;

/** A short human label for a job's specific test type/frequency, e.g.
 * "6-monthly discharge test" or "Annual RCD test". */
export function jobTitle(job: JobLike): string {
  if (job.toolType === "RCD_TESTING") {
    return job.rcdTestFrequency === "SIX_MONTHLY" ? "6-monthly RCD test" : "Annual RCD test";
  }
  return job.testType === "ANNUAL_FULL_TEST" ? "Annual full test" : "6-monthly discharge test";
}
