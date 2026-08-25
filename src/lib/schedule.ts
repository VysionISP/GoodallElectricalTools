import { prisma } from "@/lib/prisma";
import type { ToolType } from "@/generated/prisma/client";

// Computes when each site's next test is due, per tool, from the last
// completed job and its cadence:
//   Exit & Emergency Lighting: 6-monthly discharge -> +6 months,
//   annual full test -> +12 months.
//   RCD testing: 6-monthly -> +6 months, 12-monthly -> +12 months.
// A site with devices registered but no completed test is due immediately
// ("never tested"). Tools with no devices at the site are skipped. An open
// (scheduled/in-progress) job for the site+tool marks the entry as booked.

export type ScheduleStatus = "overdue" | "due-soon" | "upcoming" | "booked";

export type ScheduleItem = {
  siteId: string;
  siteName: string;
  customerId: string;
  customerName: string;
  toolType: ToolType;
  lastTested: Date | null;
  intervalMonths: number | null; // null when never tested (no cadence known yet)
  dueDate: Date;
  status: ScheduleStatus;
  daysUntilDue: number; // negative = overdue
  bookedJobId: string | null;
  bookedDate: Date | null; // the open job's scheduled date, if any
};

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function computeSchedule(businessId: string, dueSoonDays: number): Promise<ScheduleItem[]> {
  const sites = await prisma.site.findMany({
    where: { businessId },
    include: {
      customer: { select: { id: true, name: true } },
      fittings: { where: { active: true }, select: { id: true }, take: 1 },
      rcdUnits: { where: { active: true }, select: { id: true }, take: 1 },
      jobs: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          toolType: true,
          status: true,
          testType: true,
          rcdTestFrequency: true,
          completedDate: true,
          scheduledDate: true,
        },
      },
    },
  });

  const today = startOfDay(new Date());
  const items: ScheduleItem[] = [];

  for (const site of sites) {
    const tools: ToolType[] = [];
    if (site.fittings.length > 0) tools.push("EXIT_EMERGENCY_LIGHTING");
    if (site.rcdUnits.length > 0) tools.push("RCD_TESTING");

    for (const toolType of tools) {
      const toolJobs = site.jobs.filter((j) => j.toolType === toolType);
      const completed = toolJobs
        .filter((j) => j.status === "COMPLETED" && j.completedDate)
        .sort((a, b) => b.completedDate!.getTime() - a.completedDate!.getTime());
      const open = toolJobs.find((j) => j.status !== "COMPLETED") ?? null;

      const last = completed[0] ?? null;
      let intervalMonths: number | null = null;
      let dueDate: Date;

      if (last) {
        if (toolType === "EXIT_EMERGENCY_LIGHTING") {
          intervalMonths = last.testType === "ANNUAL_FULL_TEST" ? 12 : 6;
        } else {
          intervalMonths = last.rcdTestFrequency === "SIX_MONTHLY" ? 6 : 12;
        }
        dueDate = startOfDay(addMonths(last.completedDate!, intervalMonths));
      } else {
        // Devices on record but never tested — due now.
        dueDate = today;
      }

      const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / DAY_MS);
      const status: ScheduleStatus = open
        ? "booked"
        : daysUntilDue < 0 || (!last && daysUntilDue === 0)
          ? "overdue"
          : daysUntilDue <= dueSoonDays
            ? "due-soon"
            : "upcoming";

      items.push({
        siteId: site.id,
        siteName: site.name,
        customerId: site.customer.id,
        customerName: site.customer.name,
        toolType,
        lastTested: last?.completedDate ?? null,
        intervalMonths,
        dueDate,
        status,
        daysUntilDue,
        bookedJobId: open?.id ?? null,
        bookedDate: open?.scheduledDate ?? null,
      });
    }
  }

  items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  return items;
}
