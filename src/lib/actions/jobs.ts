"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedFile } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";
import type { JobStatus, TestType, FittingResult } from "@/generated/prisma/client";

const TEST_TYPES: TestType[] = ["SIX_MONTHLY_DISCHARGE", "ANNUAL_FULL_TEST"];

export async function createJobAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const siteId = String(formData.get("siteId") ?? "");
  const testType = String(formData.get("testType") ?? "SIX_MONTHLY_DISCHARGE") as TestType;
  if (!siteId) return { error: "Site is required." };
  if (!TEST_TYPES.includes(testType)) return { error: "Invalid test type." };

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.businessId !== session.user.businessId) return { error: "Site not found." };

  const technicianId = String(formData.get("technicianId") ?? "") || session.user.id;
  const scheduledDateRaw = String(formData.get("scheduledDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const job = await prisma.job.create({
    data: {
      businessId: session.user.businessId,
      siteId,
      testType,
      technicianId: technicianId || null,
      scheduledDate: scheduledDateRaw ? new Date(scheduledDateRaw) : null,
      notes,
    },
  });

  revalidatePath("/jobs");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/jobs/${job.id}`);
}

export async function setJobStatusAction(jobId: string, status: JobStatus) {
  const session = await requireSession();

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.businessId !== session.user.businessId) return;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status,
      completedDate: status === "COMPLETED" ? new Date() : job.completedDate,
    },
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/");
}

export async function deleteJobAction(jobId: string) {
  const session = await requireSession();

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.businessId !== session.user.businessId) return;

  await prisma.job.delete({ where: { id: jobId } });
  revalidatePath("/jobs");
  redirect(`/sites/${job.siteId}`);
}

const CHECKLIST_FIELDS = [
  "durationTestPass",
  "illuminationPass",
  "batteryConditionPass",
  "lampConditionPass",
  "physicalDamagePass",
  "signageVisiblePass",
] as const;

export async function saveFittingTestResultAction(
  jobId: string,
  fittingId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.businessId !== session.user.businessId) return { error: "Job not found." };

  const fitting = await prisma.fitting.findUnique({ where: { id: fittingId } });
  if (!fitting || fitting.siteId !== job.siteId) return { error: "Fitting not found." };

  const overallResult = String(formData.get("overallResult") ?? "PASS") as FittingResult;
  if (!["PASS", "FAIL", "NEEDS_REPAIR"].includes(overallResult)) {
    return { error: "Invalid result." };
  }

  const checklist: Record<string, boolean | null> = {};
  for (const field of CHECKLIST_FIELDS) {
    const raw = formData.get(field);
    checklist[field] = raw === "pass" ? true : raw === "fail" ? false : null;
  }

  const comments = String(formData.get("comments") ?? "").trim() || null;
  const repairNotes = String(formData.get("repairNotes") ?? "").trim() || null;

  const existing = await prisma.fittingTestResult.findUnique({
    where: { jobId_fittingId: { jobId, fittingId } },
  });

  let beforePhotoPath = existing?.beforePhotoPath ?? null;
  let afterPhotoPath = existing?.afterPhotoPath ?? null;

  const beforePhoto = formData.get("beforePhoto");
  if (beforePhoto instanceof File && beforePhoto.size > 0) {
    try {
      beforePhotoPath = await saveUploadedFile(beforePhoto, session.user.businessId, "job-photos", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload before photo." };
    }
  }

  const afterPhoto = formData.get("afterPhoto");
  if (afterPhoto instanceof File && afterPhoto.size > 0) {
    try {
      afterPhotoPath = await saveUploadedFile(afterPhoto, session.user.businessId, "job-photos", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload after photo." };
    }
  }

  await prisma.fittingTestResult.upsert({
    where: { jobId_fittingId: { jobId, fittingId } },
    create: {
      jobId,
      fittingId,
      overallResult,
      comments,
      repairNotes,
      beforePhotoPath,
      afterPhotoPath,
      durationTestPass: checklist.durationTestPass,
      illuminationPass: checklist.illuminationPass,
      batteryConditionPass: checklist.batteryConditionPass,
      lampConditionPass: checklist.lampConditionPass,
      physicalDamagePass: checklist.physicalDamagePass,
      signageVisiblePass: checklist.signageVisiblePass,
    },
    update: {
      overallResult,
      comments,
      repairNotes,
      beforePhotoPath,
      afterPhotoPath,
      durationTestPass: checklist.durationTestPass,
      illuminationPass: checklist.illuminationPass,
      batteryConditionPass: checklist.batteryConditionPass,
      lampConditionPass: checklist.lampConditionPass,
      physicalDamagePass: checklist.physicalDamagePass,
      signageVisiblePass: checklist.signageVisiblePass,
    },
  });

  if (job.status === "SCHEDULED") {
    await prisma.job.update({ where: { id: jobId }, data: { status: "IN_PROGRESS" } });
  }

  revalidatePath(`/jobs/${jobId}`);
}
