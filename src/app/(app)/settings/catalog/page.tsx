import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { CatalogManager } from "./catalog-manager";

export default async function CatalogSettingsPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") notFound();

  const catalog = await prisma.fittingModel.findMany({
    where: { OR: [{ businessId: null }, { businessId: session.user.businessId }] },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    include: { _count: { select: { fittings: true } } },
  });

  return <CatalogManager catalog={catalog} />;
}
