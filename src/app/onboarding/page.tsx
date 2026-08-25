import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const session = await requireSession();

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: session.user.businessId },
  });
  if (business.onboardedAt) redirect("/");

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Welcome to Field Compliance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Let&apos;s set up {business.name} — this appears on every report you generate.
          </p>
        </div>
        <OnboardingWizard business={business} />
      </div>
    </div>
  );
}
