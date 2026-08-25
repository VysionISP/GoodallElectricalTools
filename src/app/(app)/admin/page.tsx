import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";
import { BusinessesTable } from "./businesses-table";

export default async function AdminBusinessesPage() {
  const session = await requirePlatformAdmin();

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { users: true, customers: true, sites: true, jobs: true } },
    },
  });

  return <BusinessesTable businesses={businesses} ownBusinessId={session.user.businessId} />;
}
