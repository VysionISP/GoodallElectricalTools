import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireSession } from "@/lib/session";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

type JobWithSite = Prisma.JobGetPayload<{
  include: { site: { include: { customer: true } }; technician: true };
}>;

export default async function DashboardPage() {
  const session = await requireSession();
  const businessId = session.user.businessId;

  const [customerCount, siteCount, openJobs, needsRepair, recentJobs] = await Promise.all([
    prisma.customer.count({ where: { businessId } }),
    prisma.site.count({ where: { businessId } }),
    prisma.job.count({ where: { businessId, status: { not: "COMPLETED" } } }),
    prisma.fittingTestResult.count({
      where: { overallResult: "NEEDS_REPAIR", job: { businessId } },
    }),
    prisma.job.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { site: { include: { customer: true } }, technician: true },
    }),
  ]);

  const stats = [
    { label: "Customers", value: customerCount, href: "/customers" },
    { label: "Sites", value: siteCount, href: "/sites" },
    { label: "Open jobs", value: openJobs, href: "/jobs" },
    { label: "Fittings needing repair", value: needsRepair, href: "/jobs" },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session.user.name?.split(" ")[0] ?? ""}`}
        description="Here's what's happening across your jobs."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-4 hover:border-blue-300 transition-colors">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Recent jobs</h2>
        <Link href="/jobs" className="text-sm font-medium text-blue-700 hover:underline">
          View all
        </Link>
      </div>

      <Card>
        {recentJobs.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No jobs yet.{" "}
            <Link href="/sites" className="text-blue-700 hover:underline">
              Add a site
            </Link>{" "}
            to create your first testing job.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentJobs.map((job: JobWithSite) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {job.site.name} — {job.site.customer.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {job.testType === "ANNUAL_FULL_TEST" ? "Annual full test" : "6-monthly discharge test"}
                      {job.technician ? ` · ${job.technician.name}` : ""}
                      {job.scheduledDate ? ` · ${formatDate(job.scheduledDate)}` : ""}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") return <Badge color="green">Completed</Badge>;
  if (status === "IN_PROGRESS") return <Badge color="amber">In progress</Badge>;
  return <Badge color="slate">Scheduled</Badge>;
}
