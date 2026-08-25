"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import type { ToolType } from "@/generated/prisma/client";

export async function setCustomerTemplateAction(
  customerId: string,
  toolType: ToolType,
  templateId: string
) {
  const session = await requireSession();

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.businessId !== session.user.businessId) return;

  if (!templateId) {
    await prisma.customerReportTemplate.deleteMany({ where: { customerId, toolType } });
  } else {
    const template = await prisma.reportTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.businessId !== session.user.businessId || template.toolType !== toolType) return;

    await prisma.customerReportTemplate.upsert({
      where: { customerId_toolType: { customerId, toolType } },
      create: { customerId, toolType, templateId },
      update: { templateId },
    });
  }

  revalidatePath(`/customers/${customerId}`);
}
