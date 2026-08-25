import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Requires an authenticated session. Middleware already guards app routes,
 * but this keeps server components/actions safe if called directly. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}
