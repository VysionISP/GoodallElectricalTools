import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader, Card, Button } from "@/components/ui";
import { BuildingIcon, PlusIcon } from "@/components/icons";
import { CustomerForm } from "../customer-form";
import { CustomerTemplatePicker } from "./customer-template-picker";
import { updateCustomerAction, deleteCustomerAction } from "@/lib/actions/customers";
import type { ToolType } from "@/generated/prisma/client";

const TOOLS: ToolType[] = ["EXIT_EMERGENCY_LIGHTING", "RCD_TESTING"];

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const [customer, templates] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
      include: { sites: { orderBy: { name: "asc" } }, templateAssignments: true },
    }),
    prisma.reportTemplate.findMany({
      where: { businessId: session.user.businessId },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!customer || customer.businessId !== session.user.businessId) notFound();

  const boundUpdate = updateCustomerAction.bind(null, customer.id);
  const boundDelete = deleteCustomerAction.bind(null, customer.id);

  return (
    <div className="space-y-8">
      <PageHeader title={customer.name} description="Customer details & sites" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Details</h2>
          <CustomerForm customer={customer} action={boundUpdate} submitLabel="Save changes" />
          <form action={boundDelete} className="mt-3">
            <Button type="submit" variant="ghost" className="text-red-600 hover:bg-red-50">
              Delete customer
            </Button>
          </form>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Sites</h2>
            <Link href={`/sites/new?customerId=${customer.id}`}>
              <Button variant="secondary">
                <PlusIcon className="h-4 w-4" />
                Add site
              </Button>
            </Link>
          </div>
          <Card>
            {customer.sites.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No sites for this customer yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {customer.sites.map((site) => (
                  <li key={site.id}>
                    <Link
                      href={`/sites/${site.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <BuildingIcon className="h-5 w-5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{site.name}</p>
                        {site.address && (
                          <p className="truncate text-xs text-slate-500">{site.address}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Report templates</h2>
        <p className="mb-3 text-xs text-slate-500">
          Choose which template this customer&apos;s reports use for each tool. Manage templates
          under Settings → Report templates.
        </p>
        <Card className="divide-y divide-slate-100">
          {TOOLS.map((toolType) => (
            <div key={toolType} className="p-4">
              <CustomerTemplatePicker
                customerId={customer.id}
                toolType={toolType}
                templates={templates.filter((t) => t.toolType === toolType)}
                currentTemplateId={
                  customer.templateAssignments.find((a) => a.toolType === toolType)?.templateId
                }
              />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
