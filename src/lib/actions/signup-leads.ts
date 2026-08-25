"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";

function clean(value: unknown, max = 200) {
  const s = String(value ?? "").trim();
  return s ? s.slice(0, max) : null;
}

/** Called from the signup wizard as each step completes — deliberately
 * unauthenticated (the visitor has no account yet). Captures whatever is
 * known so far, keyed by email; the completed signup deletes the row, so
 * surviving rows are abandoned signups the platform owner can follow up. */
export async function saveSignupLeadAction(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
}) {
  const email = clean(input.email)?.toLowerCase();
  // Only track plausible emails, and never shadow a real account.
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return;

  const details = {
    firstName: clean(input.firstName),
    lastName: clean(input.lastName),
    mobile: clean(input.mobile, 40),
  };

  await prisma.signupLead.upsert({
    where: { email },
    create: { email, ...details },
    // Never blank out details a later step already captured.
    update: {
      ...(details.firstName ? { firstName: details.firstName } : {}),
      ...(details.lastName ? { lastName: details.lastName } : {}),
      ...(details.mobile ? { mobile: details.mobile } : {}),
    },
  });
}

/** Platform console: dismiss a lead that's been followed up or is junk. */
export async function deleteSignupLeadAction(leadId: string) {
  await requirePlatformAdmin();
  await prisma.signupLead.delete({ where: { id: leadId } }).catch(() => {});
  revalidatePath("/admin", "layout");
}
