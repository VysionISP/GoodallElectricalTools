import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDate } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  TYPE_AC: "Type AC",
  TYPE_A: "Type A",
  TYPE_B: "Type B",
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
      rcdUnits: { orderBy: { reference: "asc" } },
    },
  });

  if (!site || site.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const header = ["Reference", "Location", "Type", "Rated Current (mA)", "Status", "Date Added"];
  const rows = site.rcdUnits.map((u) => [
    u.reference,
    u.location,
    TYPE_LABELS[u.rcdType] ?? u.rcdType,
    String(u.ratedCurrentMa),
    u.active ? "Active" : "Decommissioned",
    formatDate(u.createdAt),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const filename = `${site.name.replace(/[^a-z0-9]+/gi, "-")}-rcd-units.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
