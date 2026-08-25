import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge, Card, PageHeader } from "@/components/ui";
import { ClipboardIcon } from "@/components/icons";
import { formatDate } from "@/lib/format";

export default async function JobsPage() {
  const session = await requireSession();

  const jobs = await prisma.job.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { createdAt: "desc" },
    include: { site: { include: { customer: true } }, technician: true },
  });

  return (
    <div>
      <PageHeader title="Jobs" description="Every testing visit across your sites." />

      {jobs.length === 0 ? (
        <Card className="p-10 text-center">
          <ClipboardIcon className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            No jobs yet. Open a site and click &ldquo;New test job&rdquo; to get started.
          </p>
          <Link href="/sites" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline">
            Go to sites
          </Link>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {job.site.name} — {job.site.customer.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {job.testType === "ANNUAL_FULL_TEST" ? "Annual full test" : "6-monthly discharge test"}
                      {job.technician ? ` · ${job.technician.name}` : ""}
                      {job.scheduledDate ? ` · ${formatDate(job.scheduledDate)}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") return <Badge color="green">Completed</Badge>;
  if (status === "IN_PROGRESS") return <Badge color="amber">In progress</Badge>;
  return <Badge color="slate">Scheduled</Badge>;
}
