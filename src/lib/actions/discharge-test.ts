"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { DISCHARGE_DURATION_SECONDS } from "@/lib/discharge-test-constants";

async function loadExitJob(jobId: string, businessId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.businessId !== businessId || job.toolType !== "EXIT_EMERGENCY_LIGHTING") return null;
  return job;
}

/** Quick tap during the pre-test walkthrough: is this fitting illuminated/powered? */
export async function setEnergisedAction(jobId: string, fittingId: string, pass: boolean) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job) return;

  const fitting = await prisma.fitting.findUnique({ where: { id: fittingId } });
  if (!fitting || fitting.siteId !== job.siteId) return;

  await prisma.fittingTestResult.upsert({
    where: { jobId_fittingId: { jobId, fittingId } },
    create: { jobId, fittingId, energisedPass: pass },
    update: { energisedPass: pass },
  });

  revalidatePath(`/jobs/${jobId}`);
}

/** Quick tick/cross during the 90-minute discharge test itself. */
export async function setQuickDischargeResultAction(jobId: string, fittingId: string, pass: boolean) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job) return;

  const fitting = await prisma.fitting.findUnique({ where: { id: fittingId } });
  if (!fitting || fitting.siteId !== job.siteId) return;

  await prisma.fittingTestResult.upsert({
    where: { jobId_fittingId: { jobId, fittingId } },
    create: {
      jobId,
      fittingId,
      durationTestPass: pass,
      overallResult: pass ? "PASS" : "FAIL",
    },
    update: {
      durationTestPass: pass,
      overallResult: pass ? "PASS" : "FAIL",
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}

export async function startDischargeTestAction(jobId: string) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job || job.dischargePhase !== "ENERGISED_CHECK") return;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      dischargePhase: "DISCHARGE_TEST",
      dischargeRunningSince: new Date(),
      dischargeElapsedSeconds: 0,
      status: "IN_PROGRESS",
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}

export async function pauseDischargeTestAction(jobId: string) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job || job.dischargePhase !== "DISCHARGE_TEST" || !job.dischargeRunningSince) return;

  const elapsed = job.dischargeElapsedSeconds + secondsSince(job.dischargeRunningSince);

  await prisma.job.update({
    where: { id: jobId },
    data: { dischargeRunningSince: null, dischargeElapsedSeconds: elapsed },
  });

  revalidatePath(`/jobs/${jobId}`);
}

export async function resumeDischargeTestAction(jobId: string) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job || job.dischargePhase !== "DISCHARGE_TEST" || job.dischargeRunningSince) return;
  if (job.dischargeElapsedSeconds >= DISCHARGE_DURATION_SECONDS) return;

  await prisma.job.update({
    where: { id: jobId },
    data: { dischargeRunningSince: new Date() },
  });

  revalidatePath(`/jobs/${jobId}`);
}

/** Ends the timer (naturally at 90 minutes, or manually) and moves to the
 * review/confirm step. */
export async function finishDischargeTestAction(jobId: string) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job || job.dischargePhase !== "DISCHARGE_TEST") return;

  const elapsed = job.dischargeRunningSince
    ? job.dischargeElapsedSeconds + secondsSince(job.dischargeRunningSince)
    : job.dischargeElapsedSeconds;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      dischargePhase: "REVIEW",
      dischargeRunningSince: null,
      dischargeElapsedSeconds: Math.min(elapsed, DISCHARGE_DURATION_SECONDS),
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}

/** Confirms the reviewed results and completes the job. */
export async function confirmDischargeReviewAction(jobId: string) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job || job.dischargePhase !== "REVIEW") return;

  await prisma.job.update({
    where: { id: jobId },
    data: { dischargePhase: "DONE", status: "COMPLETED", completedDate: new Date() },
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

/** Reopens a completed discharge test for further edits. */
export async function reopenDischargeReviewAction(jobId: string) {
  const session = await requireSession();
  const job = await loadExitJob(jobId, session.user.businessId);
  if (!job || job.dischargePhase !== "DONE") return;

  await prisma.job.update({
    where: { id: jobId },
    data: { dischargePhase: "REVIEW", status: "IN_PROGRESS" },
  });

  revalidatePath(`/jobs/${jobId}`);
}

function secondsSince(date: Date) {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
}
