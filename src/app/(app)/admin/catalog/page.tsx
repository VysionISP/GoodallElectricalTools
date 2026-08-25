import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";
import { CatalogManager } from "./catalog-manager";

export default async function AdminCatalogPage() {
  await requirePlatformAdmin();

  // The shared catalogue every business picks from. (A few businesses may
  // hold legacy own entries from before the catalogue was centralised;
  // those still work on their fittings but aren't managed here.)
  const catalog = await prisma.fittingModel.findMany({
    where: { businessId: null },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    include: { _count: { select: { fittings: true } } },
  });

  return <CatalogManager catalog={catalog} />;
}
