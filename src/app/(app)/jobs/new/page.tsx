import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { JobForm } from "./job-form";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const session = await requireSession();
  const { siteId } = await searchParams;

  const [sites, staff] = await Promise.all([
    prisma.site.findMany({
      where: { businessId: session.user.businessId },
      orderBy: { name: "asc" },
      include: { customer: true },
    }),
    prisma.user.findMany({
      where: { businessId: session.user.businessId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader title="New test job" />
      <JobForm
        sites={sites}
        staff={staff}
        defaultSiteId={siteId}
        defaultTechnicianId={session.user.id}
      />
    </div>
  );
}
