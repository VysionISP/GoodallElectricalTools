import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader, Card, Badge } from "@/components/ui";
import { BusinessProfileForm } from "./business-profile-form";
import { StaffForm, RemoveStaffButton } from "./staff-form";
import { PasswordForm } from "./password-form";

export default async function SettingsPage() {
  const session = await requireSession();
  const isAdmin = session.user.role === "OWNER" || session.user.role === "ADMIN";

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: session.user.businessId },
  });

  const staff = isAdmin
    ? await prisma.user.findMany({
        where: { businessId: session.user.businessId },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Business branding, contact details and staff accounts."
      />

      {isAdmin && (
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Business profile</h2>
          <Card className="p-5">
            <div className="mb-5 flex items-center gap-4">
              {business.logoPath ? (
                <Image
                  src={business.logoPath}
                  alt="Business logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg border border-slate-200 object-contain bg-white"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                  No logo
                </div>
              )}
              <p className="text-sm text-slate-500">
                This logo, and the details below, appear on every PDF compliance report you generate.
              </p>
            </div>
            <BusinessProfileForm business={business} />
          </Card>
        </section>
      )}

      {isAdmin && (
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Staff accounts</h2>
          <Card className="p-5">
            <ul className="divide-y divide-slate-100 mb-5">
              {staff.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={member.role === "OWNER" ? "blue" : "slate"}>{member.role}</Badge>
                    {member.id !== session.user.id && member.role !== "OWNER" && (
                      <RemoveStaffButton userId={member.id} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <StaffForm />
          </Card>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Your password</h2>
        <Card className="p-5 max-w-md">
          <PasswordForm />
        </Card>
      </section>
    </div>
  );
}
