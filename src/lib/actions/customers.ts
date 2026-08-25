"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";

/** Handles the optional customer logo upload; returns undefined when no new
 * file was chosen. */
async function readLogoUpload(formData: FormData, businessId: string) {
  const logo = formData.get("logo");
  if (!(logo instanceof File) || logo.size === 0) return undefined;
  return saveUploadedFile(logo, businessId, "customer-logos", "image");
}

export async function createCustomerAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Customer name is required." };

  const contactName = String(formData.get("contactName") ?? "").trim() || null;
  const contactEmail = String(formData.get("contactEmail") ?? "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  let logoPath: string | undefined;
  try {
    logoPath = await readLogoUpload(formData, session.user.businessId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not upload logo." };
  }

  const customer = await prisma.customer.create({
    data: {
      businessId: session.user.businessId,
      name,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      logoPath,
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomerAction(
  customerId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.businessId !== session.user.businessId) {
    return { error: "Customer not found." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Customer name is required." };

  let logoPath: string | undefined;
  try {
    logoPath = await readLogoUpload(formData, session.user.businessId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not upload logo." };
  }
  if (logoPath) await deleteUploadedFile(session.user.businessId, customer.logoPath);

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name,
      contactName: String(formData.get("contactName") ?? "").trim() || null,
      contactEmail: String(formData.get("contactEmail") ?? "").trim() || null,
      contactPhone: String(formData.get("contactPhone") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      ...(logoPath ? { logoPath } : {}),
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function deleteCustomerAction(customerId: string) {
  const session = await requireSession();

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.businessId !== session.user.businessId) return;

  await prisma.customer.delete({ where: { id: customerId } });
  await deleteUploadedFile(session.user.businessId, customer.logoPath);
  revalidatePath("/customers");
  redirect("/customers");
}
