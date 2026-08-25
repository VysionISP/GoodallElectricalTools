"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";
import type { FittingType } from "@/generated/prisma/client";

const FITTING_TYPES: FittingType[] = ["EXIT_SIGN", "EMERGENCY_LIGHT", "COMBINED"];

export async function createFittingAction(
  siteId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.businessId !== session.user.businessId) return { error: "Site not found." };

  const reference = String(formData.get("reference") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const fittingType = String(formData.get("fittingType") ?? "EMERGENCY_LIGHT") as FittingType;
  if (!reference || !location) return { error: "Reference and location are required." };
  if (!FITTING_TYPES.includes(fittingType)) return { error: "Invalid fitting type." };

  let photoPath: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveUploadedFile(photo, session.user.businessId, "fittings", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload photo." };
    }
  }

  await prisma.fitting.create({
    data: { siteId, reference, location, fittingType, photoPath },
  });

  revalidatePath(`/sites/${siteId}`);
}

export async function updateFittingAction(
  fittingId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const fitting = await prisma.fitting.findUnique({ where: { id: fittingId }, include: { site: true } });
  if (!fitting || fitting.site.businessId !== session.user.businessId) {
    return { error: "Fitting not found." };
  }

  const reference = String(formData.get("reference") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const fittingType = String(formData.get("fittingType") ?? "EMERGENCY_LIGHT") as FittingType;
  if (!reference || !location) return { error: "Reference and location are required." };

  let photoPath: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveUploadedFile(photo, session.user.businessId, "fittings", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload photo." };
    }
    await deleteUploadedFile(session.user.businessId, fitting.photoPath);
  }

  await prisma.fitting.update({
    where: { id: fittingId },
    data: { reference, location, fittingType, ...(photoPath ? { photoPath } : {}) },
  });

  revalidatePath(`/sites/${fitting.siteId}`);
}

export async function setFittingActiveAction(fittingId: string, active: boolean) {
  const session = await requireSession();

  const fitting = await prisma.fitting.findUnique({ where: { id: fittingId }, include: { site: true } });
  if (!fitting || fitting.site.businessId !== session.user.businessId) return;

  await prisma.fitting.update({ where: { id: fittingId }, data: { active } });
  revalidatePath(`/sites/${fitting.siteId}`);
}

export async function deleteFittingAction(fittingId: string) {
  const session = await requireSession();

  const fitting = await prisma.fitting.findUnique({ where: { id: fittingId }, include: { site: true } });
  if (!fitting || fitting.site.businessId !== session.user.businessId) return;

  await prisma.fitting.delete({ where: { id: fittingId } });
  revalidatePath(`/sites/${fitting.siteId}`);
}
