"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJobAction, setJobStatusAction } from "@/lib/actions/jobs";
import { Button } from "@/components/ui";

export function JobActions({
  jobId,
  status,
  showStatusButtons = true,
}: {
  jobId: string;
  status: string;
  showStatusButtons?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {showStatusButtons && status === "SCHEDULED" && (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => startTransition(() => setJobStatusAction(jobId, "IN_PROGRESS"))}
        >
          Start job
        </Button>
      )}
      {showStatusButtons && status !== "COMPLETED" && (
        <Button
          disabled={pending}
          onClick={() => startTransition(() => setJobStatusAction(jobId, "COMPLETED"))}
        >
          Mark as completed
        </Button>
      )}
      {showStatusButtons && status === "COMPLETED" && (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => startTransition(() => setJobStatusAction(jobId, "IN_PROGRESS"))}
        >
          Re-open job
        </Button>
      )}
      <Button
        variant="ghost"
        className="text-red-600 hover:bg-red-50"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this job and all its test results?")) {
            startTransition(async () => {
              await deleteJobAction(jobId);
              router.refresh();
            });
          }
        }}
      >
        Delete job
      </Button>
    </div>
  );
}
