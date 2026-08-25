import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Button, Card, PageHeader } from "@/components/ui";
import { BuildingIcon, PlusIcon } from "@/components/icons";

export default async function SitesPage() {
  const session = await requireSession();

  const sites = await prisma.site.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { name: "asc" },
    include: { customer: true, _count: { select: { fittings: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Sites"
        description="Every site profile: fittings, floor plans and test history."
        actions={
          <Link href="/sites/new">
            <Button>
              <PlusIcon className="h-4 w-4" />
              New site
            </Button>
          </Link>
        }
      />

      {sites.length === 0 ? (
        <Card className="p-10 text-center">
          <BuildingIcon className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No sites yet.</p>
          <Link href="/sites/new" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
            Add your first site
          </Link>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {sites.map((site) => (
              <li key={site.id}>
                <Link
                  href={`/sites/${site.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{site.name}</p>
                    <p className="truncate text-xs text-slate-500">{site.customer.name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {site._count.fittings} fitting{site._count.fittings === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
