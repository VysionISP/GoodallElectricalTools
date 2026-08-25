import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma, ToolType } from "@/generated/prisma/client";
import { requireSession } from "@/lib/session";
import { Badge, Card, PageHeader } from "@/components/ui";
import { BuildingIcon, ClipboardIcon, AlertIcon, UsersIcon } from "@/components/icons";
import { ToolBadge } from "@/components/tool-badge";
import { formatDate } from "@/lib/format";
import { jobTitle, TOOL_SHORT_LABELS } from "@/lib/job-labels";

type JobWithSite = Prisma.JobGetPayload<{
  include: { site: { include: { customer: true } }; technician: true };
}>;

const TOOLS: { toolType: ToolType; subtitle: string }[] = [
  { toolType: "EXIT_EMERGENCY_LIGHTING", subtitle: "90-minute discharge and visual tests" },
  { toolType: "RCD_TESTING", subtitle: "Trip time, current and push-button tests" },
];

export default async function DashboardPage() {
  const session = await requireSession();
  const businessId = session.user.businessId;

  const [customerCount, siteCount, openJobs, fittingIssues, rcdIssues, recentJobs] = await Promise.all([
    prisma.customer.count({ where: { businessId } }),
    prisma.site.count({ where: { businessId } }),
    prisma.job.count({ where: { businessId, status: { not: "COMPLETED" } } }),
    prisma.fittingTestResult.count({
      where: { overallResult: { not: "PASS" }, job: { businessId } },
    }),
    prisma.rcdTestResult.count({
      where: { overallResult: { not: "PASS" }, job: { businessId } },
    }),
    prisma.job.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { site: { include: { customer: true } }, technician: true },
    }),
  ]);

  const stats = [
    { label: "Customers", value: customerCount, href: "/customers", icon: <UsersIcon />, tint: "bg-blue-50 text-blue-600" },
    { label: "Managed sites", value: siteCount, href: "/sites", icon: <BuildingIcon />, tint: "bg-brand-50 text-brand-700" },
    { label: "Open jobs", value: openJobs, href: "/jobs", icon: <ClipboardIcon />, tint: "bg-amber-50 text-amber-600" },
    {
      label: "Open defects",
      value: fittingIssues + rcdIssues,
      href: "/jobs",
      icon: <AlertIcon />,
      tint: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Good ${timeOfDay()}, ${session.user.name?.split(" ")[0] ?? ""}`}
        description="Here's what's happening across your jobs."
        actions={
          <Link href="/jobs/new">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-950 px-4 py-2 text-sm font-medium text-white hover:bg-brand-900">
              + New test run
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-4 hover:border-brand-300 transition-colors">
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${s.tint}`}>
                <span className="h-4 w-4">{s.icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-slate-700">What are you testing?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <Link key={t.toolType} href={`/jobs/new?toolType=${t.toolType}`}>
              <Card className="flex items-center gap-3 p-4 hover:border-brand-300 transition-colors">
                <ToolBadge toolType={t.toolType} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{TOOL_SHORT_LABELS[t.toolType]}</p>
                  <p className="text-xs text-slate-500">{t.subtitle}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Recent jobs</h2>
        <Link href="/jobs" className="text-sm font-medium text-brand-700 hover:underline">
          View all
        </Link>
      </div>

      <Card>
        {recentJobs.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No jobs yet.{" "}
            <Link href="/sites" className="text-brand-700 hover:underline">
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
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <ToolBadge toolType={job.toolType} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {job.site.name} — {job.site.customer.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {jobTitle(job)}
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

function timeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function JobStatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") return <Badge color="green">Completed</Badge>;
  if (status === "IN_PROGRESS") return <Badge color="amber">In progress</Badge>;
  return <Badge color="slate">Scheduled</Badge>;
}
