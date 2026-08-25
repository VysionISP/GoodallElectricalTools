import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { DeviceWizard } from "./device-wizard";

export default async function AddDevicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  const site = await prisma.site.findUnique({
    where: { id },
    include: { fittings: { where: { active: true }, orderBy: { reference: "asc" } } },
  });
  if (!site || site.businessId !== session.user.businessId) notFound();

  const catalog = await prisma.fittingModel.findMany({
    where: { OR: [{ businessId: null }, { businessId: session.user.businessId }] },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  });

  return (
    <div>
      <PageHeader title={`Add devices — ${site.name}`} description="Add each exit sign / emergency light one by one." />
      <DeviceWizard site={site} existingFittings={site.fittings} catalog={catalog} />
    </div>
  );
}
