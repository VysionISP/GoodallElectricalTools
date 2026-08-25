import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { JobForm } from "./job-form";
import type { ToolType } from "@/generated/prisma/client";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string; toolType?: string }>;
}) {
  const session = await requireSession();
  const { siteId, toolType } = await searchParams;

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

  const defaultToolType: ToolType | undefined =
    toolType === "RCD_TESTING" || toolType === "EXIT_EMERGENCY_LIGHTING" ? toolType : undefined;

  return (
    <div>
      <PageHeader title="New test job" />
      <JobForm
        sites={sites}
        staff={staff}
        defaultSiteId={siteId}
        defaultToolType={defaultToolType}
        defaultTechnicianId={session.user.id}
      />
    </div>
  );
}
