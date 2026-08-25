"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";

export async function createSiteAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const customerId = String(formData.get("customerId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!customerId || !name) return { error: "Customer and site name are required." };

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.businessId !== session.user.businessId) {
    return { error: "Customer not found." };
  }

  const address = String(formData.get("address") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  let mapPdfPath: string | undefined;
  const map = formData.get("mapPdf");
  if (map instanceof File && map.size > 0) {
    try {
      mapPdfPath = await saveUploadedFile(map, session.user.businessId, "site-maps", "pdf");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload site map." };
    }
  }

  const site = await prisma.site.create({
    data: {
      businessId: session.user.businessId,
      customerId,
      name,
      address,
      notes,
      mapPdfPath,
    },
  });

  revalidatePath("/sites");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/sites/${site.id}`);
}

export async function updateSiteAction(
  siteId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.businessId !== session.user.businessId) return { error: "Site not found." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Site name is required." };

  let mapPdfPath: string | undefined;
  const map = formData.get("mapPdf");
  if (map instanceof File && map.size > 0) {
    try {
      mapPdfPath = await saveUploadedFile(map, session.user.businessId, "site-maps", "pdf");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload site map." };
    }
    await deleteUploadedFile(session.user.businessId, site.mapPdfPath);
  }

  await prisma.site.update({
    where: { id: siteId },
    data: {
      name,
      address: String(formData.get("address") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      ...(mapPdfPath ? { mapPdfPath } : {}),
    },
  });

  revalidatePath(`/sites/${siteId}`);
  revalidatePath("/sites");
}

export async function deleteSiteAction(siteId: string) {
  const session = await requireSession();

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.businessId !== session.user.businessId) return;

  await prisma.site.delete({ where: { id: siteId } });
  revalidatePath("/sites");
  revalidatePath(`/customers/${site.customerId}`);
  redirect(`/customers/${site.customerId}`);
}
