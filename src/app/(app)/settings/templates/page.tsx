import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge, Button, Card } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { ToolBadge } from "@/components/tool-badge";
import { TOOL_LABELS } from "@/lib/job-labels";
import { deleteTemplateAction } from "@/lib/actions/templates";
import type { ToolType } from "@/generated/prisma/client";

const TOOLS: ToolType[] = ["EXIT_EMERGENCY_LIGHTING", "RCD_TESTING"];

export default async function TemplatesPage() {
  const session = await requireSession();
  const isAdmin = session.user.role === "OWNER" || session.user.role === "ADMIN";

  const templates = await prisma.reportTemplate.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Control the layout, colors and wording of your PDF reports — per testing tool, and per
        customer if a customer needs something different (set that on the customer&apos;s page).
      </p>

      {TOOLS.map((toolType) => {
        const toolTemplates = templates.filter((t) => t.toolType === toolType);
        return (
          <section key={toolType}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ToolBadge toolType={toolType} />
                <h2 className="text-sm font-semibold text-slate-700">{TOOL_LABELS[toolType]}</h2>
              </div>
              {isAdmin && (
                <Link href={`/settings/templates/new?toolType=${toolType}`}>
                  <Button variant="secondary">
                    <PlusIcon className="h-4 w-4" />
                    New template
                  </Button>
                </Link>
              )}
            </div>
            <Card>
              {toolTemplates.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">
                  No custom templates yet — reports use the built-in default look.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {toolTemplates.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-6 w-6 shrink-0 rounded-md border border-slate-200"
                          style={{ backgroundColor: t.accentColor }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{t.name}</p>
                        </div>
                        {t.isDefault && <Badge color="green">Default</Badge>}
                      </div>
                      {isAdmin && (
                        <div className="flex shrink-0 items-center gap-3">
                          <Link
                            href={`/settings/templates/${t.id}/edit`}
                            className="text-xs font-medium text-brand-700 hover:underline"
                          >
                            Edit
                          </Link>
                          <form action={deleteTemplateAction.bind(null, t.id)}>
                            <button type="submit" className="text-xs font-medium text-slate-400 hover:text-red-600">
                              Delete
                            </button>
                          </form>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        );
      })}
    </div>
  );
}
