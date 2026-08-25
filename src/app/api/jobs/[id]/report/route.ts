import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JobReportDocument } from "@/lib/pdf/job-report";

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
          fittings: { where: { active: true }, orderBy: { reference: "asc" } },
        },
      },
      testResults: true,
    },
  });

  if (!job || job.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resultByFitting = new Map(job.testResults.map((r) => [r.fittingId, r]));
  const fittings = job.site.fittings.map((f) => ({
    ...f,
    result: resultByFitting.get(f.id),
  }));

  const buffer = await renderToBuffer(
    JobReportDocument({
      business: job.business,
      customer: job.site.customer,
      site: job.site,
      job,
      technician: job.technician,
      fittings,
    })
  );

  const filename = `${job.site.name.replace(/[^a-z0-9]+/gi, "-")}-emergency-lighting-report.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
