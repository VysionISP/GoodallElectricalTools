"use client";

import { useActionState } from "react";
import type { Business } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { updateNotificationSettingsAction } from "@/lib/actions/business";
import { Button, ErrorText, Input, Label } from "@/components/ui";

export function NotificationSettingsForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateNotificationSettingsAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Email delivery is coming soon — set your preferences now and they&apos;ll apply the moment
        it&apos;s live. The Schedule page already uses your reminder lead time to flag what&apos;s
        due soon.
      </div>

      <div className="max-w-xs">
        <Label htmlFor="notifyDaysBefore">Remind us this many days before a test is due</Label>
        <Input
          id="notifyDaysBefore"
          name="notifyDaysBefore"
          type="number"
          min={1}
          max={120}
          defaultValue={business.notifyDaysBefore}
          required
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="notifyCustomerOnDue"
          defaultChecked={business.notifyCustomerOnDue}
          className="mt-0.5"
        />
        <span>
          Also email the customer when their site&apos;s test is due
          <span className="block text-xs text-slate-400">
            Uses the contact email on the customer record.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="emailReportOnComplete"
          defaultChecked={business.emailReportOnComplete}
          className="mt-0.5"
        />
        <span>
          Email the finished PDF report to the customer when a test is completed
          <span className="block text-xs text-slate-400">
            Sent after you confirm and sign off the job.
          </span>
        </span>
      </label>

      <ErrorText>{state?.error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save notification settings"}
      </Button>
    </form>
  );
}
