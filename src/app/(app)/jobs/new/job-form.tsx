"use client";

import { useActionState } from "react";
import type { Customer, Site, User } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { createJobAction } from "@/lib/actions/jobs";
import { Button, Card, ErrorText, Input, Label, Select } from "@/components/ui";

export function JobForm({
  sites,
  staff,
  defaultSiteId,
  defaultTechnicianId,
}: {
  sites: (Site & { customer: Customer })[];
  staff: User[];
  defaultSiteId?: string;
  defaultTechnicianId?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createJobAction,
    undefined
  );

  return (
    <Card className="p-5 max-w-xl">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="siteId">Site</Label>
          <Select id="siteId" name="siteId" defaultValue={defaultSiteId ?? ""} required>
            <option value="" disabled>
              Select a site
            </option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.customer.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="testType">Test type</Label>
            <Select id="testType" name="testType" defaultValue="SIX_MONTHLY_DISCHARGE">
              <option value="SIX_MONTHLY_DISCHARGE">6-monthly discharge test</option>
              <option value="ANNUAL_FULL_TEST">Annual full test</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="technicianId">Technician</Label>
            <Select id="technicianId" name="technicianId" defaultValue={defaultTechnicianId ?? ""}>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="scheduledDate">Scheduled date</Label>
          <Input id="scheduledDate" name="scheduledDate" type="date" />
        </div>
        <div>
          <Label htmlFor="notes">Job notes</Label>
          <Input id="notes" name="notes" placeholder="Optional" />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create job"}
        </Button>
      </form>
    </Card>
  );
}
