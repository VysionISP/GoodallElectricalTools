import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { updateTemplateAction } from "@/lib/actions/templates";
import { TemplateForm } from "../../template-form";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;

  const template = await prisma.reportTemplate.findUnique({ where: { id } });
  if (!template || template.businessId !== session.user.businessId) notFound();

  const boundAction = updateTemplateAction.bind(null, template.id);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Edit report template</h1>
      <TemplateForm
        toolType={template.toolType}
        template={template}
        action={boundAction}
        submitLabel="Save changes"
      />
    </div>
  );
}
