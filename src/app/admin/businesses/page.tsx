import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { BusinessesTable } from "./businesses-table";

export default async function AdminBusinessesPage() {
  const session = await requirePlatformAdmin();

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { users: true, customers: true, sites: true, jobs: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Businesses"
        description="Every business on this platform. Suspend to block access, or delete to remove one entirely."
      />
      <BusinessesTable businesses={businesses} ownBusinessId={session.user.businessId} />
    </div>
  );
}
