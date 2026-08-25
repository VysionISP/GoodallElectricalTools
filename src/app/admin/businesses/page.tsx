import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { BusinessesTable } from "./businesses-table";
import { LeadsList } from "./leads-list";

export default async function AdminBusinessesPage() {
  const session = await requirePlatformAdmin();

  const [businesses, leads] = await Promise.all([
    prisma.business.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { users: true, customers: true, sites: true, jobs: true } },
      },
    }),
    prisma.signupLead.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Businesses"
        description="Every business on this platform. Suspend to block access, or delete to remove one entirely."
      />
      <BusinessesTable businesses={businesses} ownBusinessId={session.user.businessId} />
      <LeadsList leads={leads} />
    </div>
  );
}
