import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JobReportDocument } from "@/lib/pdf/job-report";
import { RcdJobReportDocument } from "@/lib/pdf/rcd-job-report";
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

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      business: true,
      technician: true,
      site: {
        include: {
          customer: true,
          fittings: { where: { active: true }, orderBy: { reference: "asc" }, include: { model: true } },
          rcdUnits: { where: { active: true }, orderBy: { reference: "asc" } },
        },
      },
      fittingTestResults: true,
      rcdTestResults: true,
    },
  });

  if (!job || job.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const template = await resolveTemplate(job.businessId, job.site.customerId, job.toolType);

  let buffer: Buffer;
  let filenameSuffix: string;

  if (job.toolType === "RCD_TESTING") {
    const resultByUnit = new Map(job.rcdTestResults.map((r) => [r.rcdUnitId, r]));
    const rcdUnits = job.site.rcdUnits.map((u) => ({ ...u, result: resultByUnit.get(u.id) }));

    buffer = await renderToBuffer(
      RcdJobReportDocument({
        business: job.business,
        customer: job.site.customer,
        site: job.site,
        job,
        technician: job.technician,
        rcdUnits,
        template,
      })
    );
    filenameSuffix = "rcd-report";
  } else {
    const resultByFitting = new Map(job.fittingTestResults.map((r) => [r.fittingId, r]));
    const fittings = job.site.fittings.map((f) => ({ ...f, result: resultByFitting.get(f.id) }));

    buffer = await renderToBuffer(
      JobReportDocument({
        business: job.business,
        customer: job.site.customer,
        site: job.site,
        job,
        technician: job.technician,
        fittings,
        template,
      })
    );
    filenameSuffix = "emergency-lighting-report";
  }

  const filename = `${job.site.name.replace(/[^a-z0-9]+/gi, "-")}-${filenameSuffix}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
