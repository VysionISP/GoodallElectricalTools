"use client";

import { useActionState, useState } from "react";
import type { Customer, Site, User, ToolType } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { createJobAction } from "@/lib/actions/jobs";
import { Button, Card, ErrorText, Input, Label, Select } from "@/components/ui";
import { ToolBadge } from "@/components/tool-badge";

const TOOLS: { toolType: ToolType; title: string; subtitle: string }[] = [
  {
    toolType: "EXIT_EMERGENCY_LIGHTING",
    title: "Emergency lighting",
    subtitle: "90-minute discharge and visual tests",
  },
  {
    toolType: "RCD_TESTING",
    title: "RCD testing",
    subtitle: "Trip time, current and push-button tests",
  },
];

export function JobForm({
  sites,
  staff,
  defaultSiteId,
  defaultToolType,
  defaultTechnicianId,
}: {
  sites: (Site & { customer: Customer })[];
  staff: User[];
  defaultSiteId?: string;
  defaultToolType?: ToolType;
  defaultTechnicianId?: string;
}) {
  const [toolType, setToolType] = useState<ToolType>(defaultToolType ?? "EXIT_EMERGENCY_LIGHTING");
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createJobAction,
    undefined
  );

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">What are you testing?</p>
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((t) => (
            <button
              key={t.toolType}
              type="button"
              onClick={() => setToolType(t.toolType)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                toolType === t.toolType
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <ToolBadge toolType={t.toolType} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                <p className="text-xs text-slate-500">{t.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="toolType" value={toolType} />
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
            {toolType === "EXIT_EMERGENCY_LIGHTING" ? (
              <div>
                <Label htmlFor="testType">Test type</Label>
                <Select id="testType" name="testType" defaultValue="SIX_MONTHLY_DISCHARGE">
                  <option value="SIX_MONTHLY_DISCHARGE">6-monthly discharge test</option>
                  <option value="ANNUAL_FULL_TEST">Annual full test</option>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="rcdTestFrequency">Test frequency</Label>
                <Select id="rcdTestFrequency" name="rcdTestFrequency" defaultValue="TWELVE_MONTHLY">
                  <option value="SIX_MONTHLY">6-monthly</option>
                  <option value="TWELVE_MONTHLY">12-monthly</option>
                </Select>
              </div>
            )}
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
    </div>
  );
}
