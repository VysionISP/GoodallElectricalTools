import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader, Card, Button, Badge } from "@/components/ui";
import { ClipboardIcon, FileIcon, PlusIcon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import { RegisterTabs } from "./register-tabs";
import { jobTitle } from "@/lib/job-labels";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      customer: true,
      fittings: { orderBy: { reference: "asc" }, include: { model: true } },
      rcdUnits: { orderBy: { reference: "asc" } },
      jobs: { orderBy: { createdAt: "desc" }, take: 8, include: { technician: true } },
    },
  });

  if (!site || site.businessId !== session.user.businessId) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title={site.name}
        description={
          <>
            <Link href={`/customers/${site.customerId}`} className="text-brand-700 hover:underline">
              {site.customer.name}
            </Link>
            {site.address ? ` · ${site.address}` : ""}
          </>
        }
        actions={
          <>
            <Link href={`/sites/${site.id}/edit`}>
              <Button variant="secondary">Edit site</Button>
            </Link>
            <Link href={`/jobs/new?siteId=${site.id}`}>
              <Button>
                <PlusIcon className="h-4 w-4" />
                New test job
              </Button>
            </Link>
          </>
        }
      />

      {site.mapPdfPath && (
        <a
          href={site.mapPdfPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FileIcon className="h-4 w-4 text-slate-400" />
          View site / floor plan (PDF)
        </a>
      )}

      <RegisterTabs siteId={site.id} fittings={site.fittings} rcdUnits={site.rcdUnits} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Test jobs</h2>
          <Link href="/jobs" className="text-sm font-medium text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        <Card>
          {site.jobs.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 flex items-center gap-2">
              <ClipboardIcon className="h-4 w-4 text-slate-300" />
              No test jobs recorded for this site yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {site.jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{jobTitle(job)}</p>
                      <p className="text-xs text-slate-500">
                        {job.technician ? `${job.technician.name} · ` : ""}
                        {job.scheduledDate ? formatDate(job.scheduledDate) : formatDate(job.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") return <Badge color="green">Completed</Badge>;
  if (status === "IN_PROGRESS") return <Badge color="amber">In progress</Badge>;
  return <Badge color="slate">Scheduled</Badge>;
}
