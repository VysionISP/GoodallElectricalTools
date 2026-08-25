import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDate } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  EXIT_SIGN: "Exit sign",
  EMERGENCY_LIGHT: "Emergency light",
  COMBINED: "Combined",
};

function csvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

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
      customer: true,
      fittings: { orderBy: { reference: "asc" } },
    },
  });

  if (!site || site.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const header = ["Reference", "Location", "Type", "Status", "Date Added"];
  const rows = site.fittings.map((f) => [
    f.reference,
    f.location,
    TYPE_LABELS[f.fittingType] ?? f.fittingType,
    f.active ? "Active" : "Decommissioned",
    formatDate(f.createdAt),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const filename = `${site.name.replace(/[^a-z0-9]+/gi, "-")}-fittings.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
