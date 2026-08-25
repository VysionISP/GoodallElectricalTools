import { prisma } from "@/lib/prisma";
import type { ToolType } from "@/generated/prisma/client";
import { toResolvedConfig, type ResolvedTemplateConfig } from "@/lib/report-template-config";

/** Resolves the report template config for a customer's reports of a given
 * tool: the customer's explicit assignment, else the business's default
 * template for that tool, else the built-in look. */
export async function resolveTemplate(
  businessId: string,
  customerId: string,
  toolType: ToolType
): Promise<ResolvedTemplateConfig> {
  const assignment = await prisma.customerReportTemplate.findUnique({
    where: { customerId_toolType: { customerId, toolType } },
    include: { template: true },
  });
  if (assignment) return toResolvedConfig(toolType, assignment.template);

  const businessDefault = await prisma.reportTemplate.findFirst({
    where: { businessId, toolType, isDefault: true },
  });
  return toResolvedConfig(toolType, businessDefault);
}
