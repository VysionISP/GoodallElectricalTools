"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export type ActionResult = { error: string } | undefined;

export async function signupAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const businessName = String(formData.get("businessName") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const name = `${firstName} ${lastName}`.trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const mobile = String(formData.get("mobile") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!businessName || !name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // The first account created on an install owns the platform: it manages
  // tenant businesses and the shared device catalogue via /admin.
  const isFirstBusiness = (await prisma.business.count()) === 0;

  await prisma.business.create({
    data: {
      name: businessName,
      // Their mobile seeds the business phone; onboarding lets them change it.
      phone: mobile,
      users: {
        create: {
          name,
          email,
          passwordHash,
          role: "OWNER",
          isPlatformAdmin: isFirstBusiness,
        },
      },
    },
  });

  // Signup finished — this person is no longer an abandoned-signup lead.
  await prisma.signupLead.deleteMany({ where: { email } });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}

export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Platform admins land on the platform console; everyone else on their
  // business dashboard. Looked up before signIn only to pick the redirect —
  // authentication itself still happens inside signIn.
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isPlatformAdmin: true },
  });
  const redirectTo = user?.isPlatformAdmin ? "/admin" : "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (err) {
    if (err && typeof err === "object" && "type" in err) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}

export async function logoutAction() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/login" });
}
