import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { SiteForm } from "../site-form";
import { createSiteAction } from "@/lib/actions/sites";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const session = await requireSession();
  const { customerId } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="New site" />
      <SiteForm
        customers={customers}
        defaultCustomerId={customerId}
        action={createSiteAction}
        submitLabel="Create site"
      />
    </div>
  );
}
