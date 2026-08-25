import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Button, Card, PageHeader } from "@/components/ui";
import { PlusIcon, UsersIcon } from "@/components/icons";

export default async function CustomersPage() {
  const session = await requireSession();

  const customers = await prisma.customer.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { name: "asc" },
    include: { _count: { select: { sites: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage the businesses you provide testing services to."
        actions={
          <Link href="/customers/new">
            <Button>
              <PlusIcon className="h-4 w-4" />
              New customer
            </Button>
          </Link>
        }
      />

      {customers.length === 0 ? (
        <Card className="p-10 text-center">
          <UsersIcon className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No customers yet.</p>
          <Link href="/customers/new" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline">
            Add your first customer
          </Link>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {customers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {c.contactName ?? c.contactEmail ?? c.contactPhone ?? "No contact details"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {c._count.sites} site{c._count.sites === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
