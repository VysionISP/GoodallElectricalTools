import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader, Card, Badge, Button } from "@/components/ui";
import { DownloadIcon } from "@/components/icons";
import { ToolBadge } from "@/components/tool-badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { jobTitle } from "@/lib/job-labels";
import { RcdTestChecklist } from "./rcd-test-checklist";
import { DischargeTestFlow } from "./discharge-test-flow";
import { JobActions } from "./job-actions";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      site: {
        include: {
          customer: true,
          fittings: { where: { active: true }, orderBy: { reference: "asc" } },
          rcdUnits: { where: { active: true }, orderBy: { reference: "asc" } },
        },
      },
      technician: true,
      fittingTestResults: true,
      rcdTestResults: true,
    },
  });

  if (!job || job.businessId !== session.user.businessId) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${job.site.name} — ${jobTitle(job)}`}
        description={
          <Link href={`/sites/${job.siteId}`} className="text-brand-700 hover:underline">
            {job.site.customer.name} · {job.site.name}
          </Link>
        }
        actions={
          <a href={`/api/jobs/${job.id}/report`} target="_blank" rel="noreferrer">
            <Button variant="secondary">
              <DownloadIcon className="h-4 w-4" />
              PDF report
            </Button>
          </a>
        }
      />

      <Card className="p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <ToolBadge toolType={job.toolType} />
        <StatusBadge status={job.status} />
        {job.technician && (
          <span className="text-slate-500">
            Technician: <span className="text-slate-800 font-medium">{job.technician.name}</span>
          </span>
        )}
        {job.scheduledDate && (
          <span className="text-slate-500">
            Scheduled: <span className="text-slate-800 font-medium">{formatDate(job.scheduledDate)}</span>
          </span>
        )}
        {job.completedDate && (
          <span className="text-slate-500">
            Completed: <span className="text-slate-800 font-medium">{formatDateTime(job.completedDate)}</span>
          </span>
        )}
        {job.notes && <span className="text-slate-500 w-full">Notes: {job.notes}</span>}
      </Card>

      <JobActions
        jobId={job.id}
        status={job.status}
        showStatusButtons={job.toolType === "RCD_TESTING"}
      />

      {job.toolType === "RCD_TESTING" ? (
        <RcdTestChecklist jobId={job.id} rcdUnits={job.site.rcdUnits} results={job.rcdTestResults} />
      ) : (
        <DischargeTestFlow
          jobId={job.id}
          phase={job.dischargePhase}
          runningSince={job.dischargeRunningSince}
          elapsedSeconds={job.dischargeElapsedSeconds}
          fittings={job.site.fittings}
          results={job.fittingTestResults}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") return <Badge color="green">Completed</Badge>;
  if (status === "IN_PROGRESS") return <Badge color="amber">In progress</Badge>;
  return <Badge color="slate">Scheduled</Badge>;
}
