"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile, SHARED_UPLOAD_SCOPE } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";
import type { FittingType } from "@/generated/prisma/client";

// The device catalogue is centrally managed: only the platform admin can
// add products, attach photos, or remove entries. Businesses pick from the
// shared catalogue (or skip) when adding fittings — they can't extend it
// themselves for now, so every business sees one consistent product list.

const FITTING_TYPES: FittingType[] = ["EXIT_SIGN", "EMERGENCY_LIGHT", "COMBINED"];

export type CreateModelResult = { error: string } | { id: string };

/** Adds a product to the shared catalogue. Called directly (not form-bound)
 * since the caller wants the created id back. */
export async function createFittingModelAction(formData: FormData): Promise<CreateModelResult> {
  await requirePlatformAdmin();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const fittingType = String(formData.get("fittingType") ?? "") as FittingType;
  if (!brand || !model) return { error: "Brand and model are required." };
  if (!FITTING_TYPES.includes(fittingType)) return { error: "Invalid fitting type." };

  let photoPath: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveUploadedFile(photo, SHARED_UPLOAD_SCOPE, "fitting-models", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload photo." };
    }
  }

  const created = await prisma.fittingModel.create({
    data: { businessId: null, brand, model, fittingType, photoPath },
  });

  // The wizard lives under /sites/[id]/devices/new and the admin manager
  // under /admin/catalog — refresh both trees.
  revalidatePath("/sites", "layout");
  revalidatePath("/admin", "layout");
  return { id: created.id };
}

/** Sets/replaces the reference photo on a catalogue entry. */
export async function setFittingModelPhotoAction(
  modelId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requirePlatformAdmin();

  const model = await prisma.fittingModel.findUnique({ where: { id: modelId } });
  if (!model) return { error: "Catalogue entry not found." };

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
  revalidatePath("/sites", "layout");
  revalidatePath("/admin", "layout");
}

/** Removes a catalogue entry. Entries still linked to recorded fittings are
 * blocked so no site register silently loses its model info. */
export async function deleteFittingModelAction(modelId: string): Promise<ActionResult> {
  await requirePlatformAdmin();

  const model = await prisma.fittingModel.findUnique({
    where: { id: modelId },
    include: { _count: { select: { fittings: true } } },
  });
  if (!model) return { error: "Catalogue entry not found." };
  if (model._count.fittings > 0) {
    return {
      error: `This model is linked to ${model._count.fittings} recorded fitting(s) and can't be deleted.`,
    };
  }

  await deleteUploadedFile(model.businessId ?? SHARED_UPLOAD_SCOPE, model.photoPath);
  await prisma.fittingModel.delete({ where: { id: modelId } });

  revalidatePath("/sites", "layout");
  revalidatePath("/admin", "layout");
}
