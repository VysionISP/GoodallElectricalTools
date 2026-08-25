"use client";

import { useState } from "react";
import type { SignupLead } from "@/generated/prisma/client";
import { deleteSignupLeadAction } from "@/lib/actions/signup-leads";
import { Card } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";

export function LeadsList({ leads }: { leads: SignupLead[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (leads.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-1 text-sm font-semibold text-slate-700">
        Incomplete signups <span className="font-normal text-slate-400">({leads.length})</span>
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        People who started signing up but didn&apos;t finish — worth a follow-up call or email.
      </p>
      <Card>
        <ul className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <li key={lead.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Name not captured"}
                  {lead.businessName && (
                    <span className="font-normal text-slate-500"> — {lead.businessName}</span>
                  )}
                </p>
                <p className="truncate text-xs text-slate-500">
                  <a href={`mailto:${lead.email}`} className="text-brand-700 hover:underline">
                    {lead.email}
                  </a>
                  {lead.mobile && (
                    <>
                      {" · "}
                      <a href={`tel:${lead.mobile}`} className="text-brand-700 hover:underline">
                        {lead.mobile}
                      </a>
                    </>
                  )}
                  {" · started "}
                  {formatDateTime(lead.createdAt)}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId === lead.id}
                onClick={async () => {
                  if (!confirm(`Remove ${lead.email} from the list?`)) return;
                  setBusyId(lead.id);
                  await deleteSignupLeadAction(lead.id);
                  setBusyId(null);
                }}
                className="shrink-0 text-slate-400 hover:text-red-600 disabled:opacity-50"
                aria-label={`Dismiss lead ${lead.email}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
