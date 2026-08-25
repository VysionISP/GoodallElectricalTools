"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile, SHARED_UPLOAD_SCOPE } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";
import type { FittingType } from "@/generated/prisma/client";

const FITTING_TYPES: FittingType[] = ["EXIT_SIGN", "EMERGENCY_LIGHT", "COMBINED"];

export type CreateModelResult = { error: string } | { id: string };

/** Adds a business's own catalog entry — used when a device's brand/model
 * isn't in the shared catalog yet. Returns the new entry's id so the wizard
 * can select it immediately. Called directly (not form-bound) since the
 * caller needs the created id back. */
export async function createFittingModelAction(formData: FormData): Promise<CreateModelResult> {
  const session = await requireSession();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const fittingType = String(formData.get("fittingType") ?? "") as FittingType;
  if (!brand || !model) return { error: "Brand and model are required." };
  if (!FITTING_TYPES.includes(fittingType)) return { error: "Invalid fitting type." };

  let photoPath: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveUploadedFile(photo, session.user.businessId, "fitting-models", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload photo." };
    }
  }

  const created = await prisma.fittingModel.create({
    data: { businessId: session.user.businessId, brand, model, fittingType, photoPath },
  });

  revalidatePath("/sites");
  return { id: created.id };
}

/** Sets/replaces the reference photo on any catalog entry the technician can
 * see (shared or their own business's), so photos fill in organically as
 * real devices are actually photographed on site. */
export async function setFittingModelPhotoAction(
  modelId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const model = await prisma.fittingModel.findUnique({ where: { id: modelId } });
  if (!model || (model.businessId !== null && model.businessId !== session.user.businessId)) {
    return { error: "Catalog entry not found." };
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return { error: "Choose a photo." };

  const scope = model.businessId ?? SHARED_UPLOAD_SCOPE;
  let photoPath: string;
  try {
    photoPath = await saveUploadedFile(photo, scope, "fitting-models", "image");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not upload photo." };
  }
  await deleteUploadedFile(scope, model.photoPath);

  await prisma.fittingModel.update({ where: { id: modelId }, data: { photoPath } });
  revalidatePath("/sites");
}
