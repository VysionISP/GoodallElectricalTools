"use client";

import { useTransition } from "react";
import type { ReportTemplate, ToolType } from "@/generated/prisma/client";
import { setCustomerTemplateAction } from "@/lib/actions/customer-templates";
import { Select } from "@/components/ui";
import { ToolBadge } from "@/components/tool-badge";
import { TOOL_LABELS } from "@/lib/job-labels";

export function CustomerTemplatePicker({
  customerId,
  toolType,
  templates,
  currentTemplateId,
}: {
  customerId: string;
  toolType: ToolType;
  templates: ReportTemplate[];
  currentTemplateId?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <ToolBadge toolType={toolType} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{TOOL_LABELS[toolType]}</p>
      </div>
      <Select
        className="w-56"
        disabled={pending || templates.length === 0}
        defaultValue={currentTemplateId ?? ""}
        onChange={(e) => {
          const templateId = e.target.value;
          startTransition(() => setCustomerTemplateAction(customerId, toolType, templateId));
        }}
      >
        <option value="">Business default</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
