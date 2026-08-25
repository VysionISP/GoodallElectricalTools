"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { ActionResult } from "@/lib/actions/auth";
import type { ToolType } from "@/generated/prisma/client";
import { COLUMN_DEFS } from "@/lib/report-template-config";

const TOOL_TYPES: ToolType[] = ["EXIT_EMERGENCY_LIGHTING", "RCD_TESTING"];

function readTemplateFields(toolType: ToolType, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "#047857").trim();
  const showStatCards = formData.get("showStatCards") === "on";
  const showPhotos = formData.get("showPhotos") === "on";
  const isDefault = formData.get("isDefault") === "on";
  const allowedColumns = new Set(COLUMN_DEFS[toolType].map((c) => c.key));
  const columns = formData.getAll("columns").filter((c): c is string => typeof c === "string" && allowedColumns.has(c));
  const headerText = String(formData.get("headerText") ?? "").trim() || null;
  const footerText = String(formData.get("footerText") ?? "").trim() || null;
  const disclaimerText = String(formData.get("disclaimerText") ?? "").trim() || null;

  return { name, accentColor, showStatCards, showPhotos, isDefault, columns, headerText, footerText, disclaimerText };
}

export async function createTemplateAction(
  toolType: ToolType,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!TOOL_TYPES.includes(toolType)) return { error: "Invalid tool." };

  const fields = readTemplateFields(toolType, formData);
  if (!fields.name) return { error: "Template name is required." };
  if (!/^#[0-9a-fA-F]{6}$/.test(fields.accentColor)) {
    return { error: "Accent color must be a hex value, e.g. #047857." };
  }

  await prisma.$transaction(async (tx) => {
    if (fields.isDefault) {
      await tx.reportTemplate.updateMany({
        where: { businessId: session.user.businessId, toolType },
        data: { isDefault: false },
      });
    }
    await tx.reportTemplate.create({
      data: {
        businessId: session.user.businessId,
        toolType,
        name: fields.name,
        isDefault: fields.isDefault,
        accentColor: fields.accentColor,
        showStatCards: fields.showStatCards,
        showPhotos: fields.showPhotos,
        tableColumns: fields.columns,
        headerText: fields.headerText,
        footerText: fields.footerText,
        disclaimerText: fields.disclaimerText,
      },
    });
  });

  revalidatePath("/settings/templates");
  redirect(`/settings/templates?tool=${toolType}`);
}

export async function updateTemplateAction(
  templateId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();

  const template = await prisma.reportTemplate.findUnique({ where: { id: templateId } });
  if (!template || template.businessId !== session.user.businessId) {
    return { error: "Template not found." };
  }

  const fields = readTemplateFields(template.toolType, formData);
  if (!fields.name) return { error: "Template name is required." };
  if (!/^#[0-9a-fA-F]{6}$/.test(fields.accentColor)) {
    return { error: "Accent color must be a hex value, e.g. #047857." };
  }

  await prisma.$transaction(async (tx) => {
    if (fields.isDefault) {
      await tx.reportTemplate.updateMany({
        where: { businessId: session.user.businessId, toolType: template.toolType, id: { not: templateId } },
        data: { isDefault: false },
      });
    }
    await tx.reportTemplate.update({
      where: { id: templateId },
      data: {
        name: fields.name,
        isDefault: fields.isDefault,
        accentColor: fields.accentColor,
        showStatCards: fields.showStatCards,
        showPhotos: fields.showPhotos,
        tableColumns: fields.columns,
        headerText: fields.headerText,
        footerText: fields.footerText,
        disclaimerText: fields.disclaimerText,
      },
    });
  });

  revalidatePath("/settings/templates");
  redirect(`/settings/templates?tool=${template.toolType}`);
}

export async function deleteTemplateAction(templateId: string) {
  const session = await requireAdmin();

  const template = await prisma.reportTemplate.findUnique({ where: { id: templateId } });
  if (!template || template.businessId !== session.user.businessId) return;

  await prisma.reportTemplate.delete({ where: { id: templateId } });
  revalidatePath("/settings/templates");
  redirect(`/settings/templates?tool=${template.toolType}`);
}
