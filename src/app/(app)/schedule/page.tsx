import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { computeSchedule, type ScheduleItem } from "@/lib/schedule";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { TOOL_SHORT_LABELS } from "@/lib/job-labels";

// The schedule: when each site's next test is due, as a month calendar plus
// overdue/upcoming lists. Month navigation is plain links (?month=YYYY-MM).

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await requireSession();
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: session.user.businessId },
    select: { notifyDaysBefore: true },
  });

  const items = await computeSchedule(session.user.businessId, business.notifyDaysBefore);

  const { month: monthParam } = await searchParams;
  const now = new Date();
  const [year, month] = parseMonth(monthParam) ?? [now.getFullYear(), now.getMonth()];

  const overdue = items.filter((i) => i.status === "overdue");
  const dueSoon = items.filter((i) => i.status === "due-soon");
  const booked = items.filter((i) => i.status === "booked");
  const upcoming = items.filter((i) => i.status !== "overdue");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        description={`When each site's next test is due. Reminders are set to ${business.notifyDaysBefore} days before due — email delivery is coming soon (see Settings → Notifications).`}
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Overdue" value={overdue.length} tone={overdue.length > 0 ? "text-fault" : "text-slate-900"} />
        <StatCard label={`Due within ${business.notifyDaysBefore} days`} value={dueSoon.length} tone="text-warning" />
        <StatCard label="Booked" value={booked.length} tone="text-verified-600" />
      </div>

      {overdue.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-fault">Overdue</h2>
          <Card>
            <ul className="divide-y divide-slate-100">
              {overdue.map((item) => (
                <ScheduleRow key={rowKey(item)} item={item} />
              ))}
            </ul>
          </Card>
        </div>
      )}

      <MonthCalendar year={year} month={month} items={items} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Coming up</h2>
        <Card>
          {upcoming.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              Nothing scheduled yet — add sites with fittings or RCDs and their tests will appear
              here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((item) => (
                <ScheduleRow key={rowKey(item)} item={item} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function rowKey(item: ScheduleItem) {
  return `${item.siteId}-${item.toolType}`;
}

function parseMonth(raw: string | undefined): [number, number] | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  if (mo < 0 || mo > 11) return null;
  return [y, mo];
}

function monthKey(y: number, m: number) {
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card className="p-4">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </Card>
  );
}

function StatusBadge({ item }: { item: ScheduleItem }) {
  if (item.status === "booked") return <Badge color="green">Booked</Badge>;
  if (item.status === "overdue")
    return <Badge color="red">{item.lastTested ? `${-item.daysUntilDue}d overdue` : "Never tested"}</Badge>;
  if (item.status === "due-soon") return <Badge color="amber">Due in {item.daysUntilDue}d</Badge>;
  return <Badge color="slate">Due {formatDate(item.dueDate)}</Badge>;
}

function ScheduleRow({ item }: { item: ScheduleItem }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">
          <Link href={`/sites/${item.siteId}`} className="hover:underline">
            {item.siteName}
          </Link>{" "}
          <span className="font-normal text-slate-400">· {item.customerName}</span>
        </p>
        <p className="text-xs text-slate-500">
          {TOOL_SHORT_LABELS[item.toolType]} ·{" "}
          {item.lastTested
            ? `last tested ${formatDate(item.lastTested)}${item.intervalMonths ? ` (${item.intervalMonths}-monthly)` : ""}`
            : "no completed test on record"}
          {item.status === "booked" &&
            ` · job open${item.bookedDate ? `, scheduled ${formatDate(item.bookedDate)}` : ""}`}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <StatusBadge item={item} />
        {item.status === "booked" ? (
          <Link
            href={`/jobs/${item.bookedJobId}`}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Open job
          </Link>
        ) : (
          <Link
            href={`/jobs/new?siteId=${item.siteId}&toolType=${item.toolType}`}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Book test
          </Link>
        )}
      </div>
    </li>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MonthCalendar({ year, month, items }: { year: number; month: number; items: ScheduleItem[] }) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (first.getDay() + 6) % 7; // Monday-first
  const monthName = first.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const byDay = new Map<number, ScheduleItem[]>();
  for (const item of items) {
    const marker = item.status === "booked" && item.bookedDate ? item.bookedDate : item.dueDate;
    if (marker.getFullYear() === year && marker.getMonth() === month) {
      const day = marker.getDate();
      byDay.set(day, [...(byDay.get(day) ?? []), item]);
    }
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{monthName}</h2>
        <div className="flex items-center gap-1">
          <Link
            href={`/schedule?month=${monthKey(year, month - 1)}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ← Prev
          </Link>
          <Link
            href="/schedule"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Today
          </Link>
          <Link
            href={`/schedule?month=${monthKey(year, month + 1)}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Next →
          </Link>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-[11px] font-medium uppercase text-slate-400">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => (
            <div
              key={i}
              className={`min-h-[72px] border-b border-r border-slate-100 p-1.5 md:min-h-[92px] ${
                day === null ? "bg-slate-50/60" : ""
              }`}
            >
              {day !== null && (
                <>
                  <p
                    className={`mb-1 text-xs ${
                      isToday(day)
                        ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 font-semibold text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {day}
                  </p>
                  <div className="space-y-1">
                    {(byDay.get(day) ?? []).map((item) => (
                      <Link
                        key={rowKey(item)}
                        href={
                          item.status === "booked" && item.bookedJobId
                            ? `/jobs/${item.bookedJobId}`
                            : `/sites/${item.siteId}`
                        }
                        className={`block truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight md:text-[11px] ${
                          item.status === "booked"
                            ? "bg-verified/15 text-verified-600"
                            : item.status === "overdue"
                              ? "bg-fault/10 text-fault"
                              : item.status === "due-soon"
                                ? "bg-warning/15 text-amber-700"
                                : "bg-brand-100 text-brand-700"
                        }`}
                        title={`${item.siteName} — ${TOOL_SHORT_LABELS[item.toolType]}`}
                      >
                        {item.siteName} · {TOOL_SHORT_LABELS[item.toolType]}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
