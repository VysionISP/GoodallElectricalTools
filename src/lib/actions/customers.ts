"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "@/lib/actions/auth";

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

  const customer = await prisma.customer.create({
    data: {
      businessId: session.user.businessId,
      name,
      contactName,
      contactEmail,
      contactPhone,
      notes,
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

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name,
      contactName: String(formData.get("contactName") ?? "").trim() || null,
      contactEmail: String(formData.get("contactEmail") ?? "").trim() || null,
      contactPhone: String(formData.get("contactPhone") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
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
  revalidatePath("/customers");
  redirect("/customers");
}
