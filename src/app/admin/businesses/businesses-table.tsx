"use client";

import { useState } from "react";
import type { Business } from "@/generated/prisma/client";
import { deleteBusinessAction, setBusinessSuspendedAction } from "@/lib/actions/platform-admin";
import { Badge, Card, ErrorText } from "@/components/ui";
import { formatDate } from "@/lib/format";

type BusinessRow = Business & {
  _count: { users: number; customers: number; sites: number; jobs: number };
};

export function BusinessesTable({
  businesses,
  ownBusinessId,
}: {
  businesses: BusinessRow[];
  ownBusinessId: string;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  async function toggleSuspended(b: BusinessRow) {
    if (
      !b.suspended &&
      !confirm(`Suspend ${b.name}? Their users will be signed out and unable to sign in.`)
    ) {
      return;
    }
    setBusyId(b.id);
    setError(undefined);
    const result = await setBusinessSuspendedAction(b.id, !b.suspended);
    setBusyId(null);
    if (result?.error) setError(result.error);
  }

  async function remove(b: BusinessRow) {
    if (
      !confirm(
        `Permanently delete ${b.name}? This removes all of their users, customers, sites, jobs, results and reports. This cannot be undone.`
      )
    ) {
      return;
    }
    setBusyId(b.id);
    setError(undefined);
    const result = await deleteBusinessAction(b.id);
    setBusyId(null);
    if (result?.error) setError(result.error);
  }

  return (
    <div>
      <ErrorText>{error}</ErrorText>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Users</th>
                <th className="px-4 py-3 font-medium">Customers</th>
                <th className="px-4 py-3 font-medium">Sites</th>
                <th className="px-4 py-3 font-medium">Test jobs</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.map((b) => {
                const isOwn = b.id === ownBusinessId;
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{b.name}</p>
                      {b.email && <p className="text-xs text-slate-400">{b.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b._count.users}</td>
                    <td className="px-4 py-3 text-slate-600">{b._count.customers}</td>
                    <td className="px-4 py-3 text-slate-600">{b._count.sites}</td>
                    <td className="px-4 py-3 text-slate-600">{b._count.jobs}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3">
                      {isOwn ? (
                        <Badge color="blue">Platform owner</Badge>
                      ) : b.suspended ? (
                        <Badge color="red">Suspended</Badge>
                      ) : (
                        <Badge color="green">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isOwn && (
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => toggleSuspended(b)}
                            className="text-xs font-medium text-brand-700 hover:underline disabled:opacity-50"
                          >
                            {b.suspended ? "Restore" : "Suspend"}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => remove(b)}
                            className="text-xs font-medium text-slate-400 hover:text-red-600 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
