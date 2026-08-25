import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SiteRcdReportDocument } from "@/lib/pdf/site-rcd-report";
import { resolveTemplate } from "@/lib/templates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      business: true,
      customer: true,
      rcdUnits: { where: { active: true }, orderBy: { reference: "asc" } },
    },
  });

  if (!site || site.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const template = await resolveTemplate(site.businessId, site.customerId, "RCD_TESTING");

  const buffer = await renderToBuffer(
    SiteRcdReportDocument({
      business: site.business,
      customer: site.customer,
      site,
      rcdUnits: site.rcdUnits,
      template,
    })
  );

  const filename = `${site.name.replace(/[^a-z0-9]+/gi, "-")}-rcd-register.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
