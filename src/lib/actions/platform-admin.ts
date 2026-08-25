"use server";

import { rm } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";
import { UPLOAD_ROOT } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";

/** Suspends or restores a tenant business. Suspended businesses' users
 * can't sign in, and active sessions get bounced on their next request. */
export async function setBusinessSuspendedAction(
  businessId: string,
  suspended: boolean
): Promise<ActionResult> {
  const session = await requirePlatformAdmin();
  if (businessId === session.user.businessId) {
    return { error: "You can't suspend your own business." };
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return { error: "Business not found." };

  await prisma.business.update({ where: { id: businessId }, data: { suspended } });
  revalidatePath("/admin");
}

/** Permanently deletes a tenant business and everything under it —
 * users, customers, sites, fittings, jobs, results, templates (all
 * cascade) plus its uploaded files on disk. */
export async function deleteBusinessAction(businessId: string): Promise<ActionResult> {
  const session = await requirePlatformAdmin();
  if (businessId === session.user.businessId) {
    return { error: "You can't delete your own business." };
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return { error: "Business not found." };

  await prisma.business.delete({ where: { id: businessId } });

  // Best-effort cleanup of the business's upload folder. The path is built
  // from the DB id (a cuid), not user input, and constrained under
  // UPLOAD_ROOT.
  const dir = path.join(UPLOAD_ROOT, businessId);
  if (dir.startsWith(UPLOAD_ROOT + path.sep)) {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }

  revalidatePath("/admin");
}
