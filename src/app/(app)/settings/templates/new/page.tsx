import { requireAdmin } from "@/lib/session";
import { createTemplateAction } from "@/lib/actions/templates";
import { TemplateForm } from "../template-form";
import type { ToolType } from "@/generated/prisma/client";

export default async function NewTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ toolType?: string }>;
}) {
  await requireAdmin();
  const { toolType: raw } = await searchParams;
  const toolType: ToolType = raw === "RCD_TESTING" ? "RCD_TESTING" : "EXIT_EMERGENCY_LIGHTING";

  const boundAction = createTemplateAction.bind(null, toolType);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">New report template</h1>
      <TemplateForm toolType={toolType} action={boundAction} submitLabel="Create template" />
    </div>
  );
}
