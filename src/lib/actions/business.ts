"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";

export async function updateBusinessAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();
  const businessId = session.user.businessId;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Business name is required." };

  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const recNumber = String(formData.get("recNumber") ?? "").trim() || null;
  const abn = String(formData.get("abn") ?? "").trim() || null;

  let logoPath: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    try {
      logoPath = await saveUploadedFile(logo, businessId, "logos", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload logo." };
    }
    const existing = await prisma.business.findUnique({ where: { id: businessId } });
    await deleteUploadedFile(businessId, existing?.logoPath);
  }

  await prisma.business.update({
    where: { id: businessId },
    data: { name, email, phone, address, recNumber, abn, ...(logoPath ? { logoPath } : {}) },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function createStaffAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();
  const businessId = session.user.businessId;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "TECHNICIAN");

  if (!name || !email || !password) return { error: "All fields are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!["ADMIN", "TECHNICIAN"].includes(role)) return { error: "Invalid role." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with that email already exists." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { businessId, name, email, passwordHash, role: role as "ADMIN" | "TECHNICIAN" },
  });

  revalidatePath("/settings");
}

export async function removeStaffAction(userId: string) {
  const session = await requireAdmin();
  const businessId = session.user.businessId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.businessId !== businessId) return;
  if (user.id === session.user.id) return; // can't remove yourself

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/settings");
}

export async function updatePasswordAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!currentPassword || !newPassword) return { error: "All fields are required." };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  revalidatePath("/settings");
}
