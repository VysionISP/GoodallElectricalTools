import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SiteFittingsReportDocument } from "@/lib/pdf/site-fittings-report";

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
      fittings: { where: { active: true }, orderBy: { reference: "asc" } },
    },
  });

  if (!site || site.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    SiteFittingsReportDocument({
      business: site.business,
      customer: site.customer,
      site,
      fittings: site.fittings,
    })
  );

  const filename = `${site.name.replace(/[^a-z0-9]+/gi, "-")}-fitting-register.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
