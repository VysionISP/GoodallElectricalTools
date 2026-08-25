import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TemplatePreviewDocument } from "@/lib/pdf/template-preview";
import { DEFAULT_ACCENT_COLOR, parseHeaderLayout, parseTemplateColumns, type ResolvedTemplateConfig } from "@/lib/report-template-config";
import type { ToolType } from "@/generated/prisma/client";

/** Renders a live preview PDF from the current (possibly unsaved) template
 * form fields, so a template can be previewed before saving. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const toolTypeRaw = String(formData.get("toolType") ?? "");
  const toolType: ToolType = toolTypeRaw === "RCD_TESTING" ? "RCD_TESTING" : "EXIT_EMERGENCY_LIGHTING";

  const accentColorRaw = String(formData.get("accentColor") ?? DEFAULT_ACCENT_COLOR).trim();
  const accentColor = /^#[0-9a-fA-F]{6}$/.test(accentColorRaw) ? accentColorRaw : DEFAULT_ACCENT_COLOR;

  const template: ResolvedTemplateConfig = {
    accentColor,
    headerLayout: parseHeaderLayout(formData.get("headerLayout")),
    showCustomerLogo: formData.get("showCustomerLogo") === "on",
    showStatCards: formData.get("showStatCards") === "on",
    showPhotos: formData.get("showPhotos") === "on",
    columns: parseTemplateColumns(toolType, formData.getAll("columns")),
    headerText: String(formData.get("headerText") ?? "").trim() || null,
    footerText: String(formData.get("footerText") ?? "").trim() || null,
    disclaimerText: String(formData.get("disclaimerText") ?? "").trim() || null,
  };

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: session.user.businessId },
  });

  const buffer = await renderToBuffer(TemplatePreviewDocument({ business, toolType, template }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="template-preview.pdf"`,
    },
  });
}
