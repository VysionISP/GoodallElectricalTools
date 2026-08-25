import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/** Requires an authenticated session. Middleware already guards app routes,
 * but this keeps server components/actions safe if called directly. Also
 * enforces business suspension: a suspended business's users (except
 * platform admins) are bounced to /suspended on their next request, so a
 * platform-admin suspension takes effect even mid-session. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.isPlatformAdmin) {
    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
      select: { suspended: true },
    });
    if (!business || business.suspended) redirect("/suspended");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

/** Requires the platform owner (super admin). The flag is re-checked
 * against the database rather than trusted from the JWT, so revoking it
 * takes effect immediately. */
export async function requirePlatformAdmin() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPlatformAdmin: true },
  });
  if (!user?.isPlatformAdmin) redirect("/dashboard");
  return session;
}
