import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function AdminOverviewPage() {
  await requirePlatformAdmin();

  const [businessCount, suspendedCount, userCount, siteCount, jobCount, openJobCount, productCount, recentBusinesses] =
    await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { suspended: true } }),
      prisma.user.count(),
      prisma.site.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: { not: "COMPLETED" } } }),
      prisma.fittingModel.count({ where: { businessId: null } }),
      prisma.business.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { users: true, jobs: true } } },
      }),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform overview"
        description="Everything running on this install, across every business."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Businesses"
          value={businessCount}
          sub={suspendedCount > 0 ? `${suspendedCount} suspended` : "all active"}
        />
        <StatCard label="Users" value={userCount} sub="across all businesses" />
        <StatCard label="Sites" value={siteCount} sub="under management" />
        <StatCard label="Test jobs" value={jobCount} sub={`${openJobCount} open`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Newest businesses</h2>
            <Link href="/admin/businesses" className="text-sm font-medium text-brand-700 hover:underline">
              Manage all
            </Link>
          </div>
          <Card>
            {recentBusinesses.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No businesses yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentBusinesses.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{b.name}</p>
                      <p className="text-xs text-slate-500">
                        {b._count.users} user{b._count.users === 1 ? "" : "s"} · {b._count.jobs} job
                        {b._count.jobs === 1 ? "" : "s"} · joined {formatDate(b.createdAt)}
                      </p>
                    </div>
                    {b.suspended ? <Badge color="red">Suspended</Badge> : <Badge color="green">Active</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Shared device catalogue</h2>
            <Link href="/admin/catalog" className="text-sm font-medium text-brand-700 hover:underline">
              Manage
            </Link>
          </div>
          <Card className="p-5">
            <p className="text-3xl font-bold text-slate-900">{productCount}</p>
            <p className="mt-1 text-sm text-slate-500">
              products available to every business&apos;s technicians when they register fittings.
              Keep photos attached so devices can be visually matched on site.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-600">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </Card>
  );
}
