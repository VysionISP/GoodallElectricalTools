"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";
import type { RcdType } from "@/generated/prisma/client";

const RCD_TYPES: RcdType[] = ["TYPE_AC", "TYPE_A", "TYPE_B"];

function parseRatedCurrent(formData: FormData): ActionResult | number {
  const raw = String(formData.get("ratedCurrentMa") ?? "30").trim();
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return { error: "Rated current must be a positive number." };
  }
  return value;
}

export async function createRcdUnitAction(
  siteId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.businessId !== session.user.businessId) return { error: "Site not found." };

  const reference = String(formData.get("reference") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const rcdType = String(formData.get("rcdType") ?? "TYPE_A") as RcdType;
  if (!reference || !location) return { error: "Reference and location are required." };
  if (!RCD_TYPES.includes(rcdType)) return { error: "Invalid RCD type." };

  const ratedCurrentMa = parseRatedCurrent(formData);
  if (typeof ratedCurrentMa !== "number") return ratedCurrentMa;

  let photoPath: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveUploadedFile(photo, session.user.businessId, "fittings", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload photo." };
    }
  }

  await prisma.rcdUnit.create({
    data: { siteId, reference, location, rcdType, ratedCurrentMa, photoPath },
  });

  revalidatePath(`/sites/${siteId}`);
}

export async function updateRcdUnitAction(
  rcdUnitId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const rcdUnit = await prisma.rcdUnit.findUnique({ where: { id: rcdUnitId }, include: { site: true } });
  if (!rcdUnit || rcdUnit.site.businessId !== session.user.businessId) {
    return { error: "RCD not found." };
  }

  const reference = String(formData.get("reference") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const rcdType = String(formData.get("rcdType") ?? "TYPE_A") as RcdType;
  if (!reference || !location) return { error: "Reference and location are required." };

  const ratedCurrentMa = parseRatedCurrent(formData);
  if (typeof ratedCurrentMa !== "number") return ratedCurrentMa;

  let photoPath: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveUploadedFile(photo, session.user.businessId, "fittings", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload photo." };
    }
    await deleteUploadedFile(session.user.businessId, rcdUnit.photoPath);
  }

  await prisma.rcdUnit.update({
    where: { id: rcdUnitId },
    data: { reference, location, rcdType, ratedCurrentMa, ...(photoPath ? { photoPath } : {}) },
  });

  revalidatePath(`/sites/${rcdUnit.siteId}`);
}

export async function setRcdUnitActiveAction(rcdUnitId: string, active: boolean) {
  const session = await requireSession();

  const rcdUnit = await prisma.rcdUnit.findUnique({ where: { id: rcdUnitId }, include: { site: true } });
  if (!rcdUnit || rcdUnit.site.businessId !== session.user.businessId) return;

  await prisma.rcdUnit.update({ where: { id: rcdUnitId }, data: { active } });
  revalidatePath(`/sites/${rcdUnit.siteId}`);
}

export async function deleteRcdUnitAction(rcdUnitId: string) {
  const session = await requireSession();

  const rcdUnit = await prisma.rcdUnit.findUnique({ where: { id: rcdUnitId }, include: { site: true } });
  if (!rcdUnit || rcdUnit.site.businessId !== session.user.businessId) return;

  await prisma.rcdUnit.delete({ where: { id: rcdUnitId } });
  revalidatePath(`/sites/${rcdUnit.siteId}`);
}
