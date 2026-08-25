"use client";

import { useActionState } from "react";
import type { Customer, Site } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { Button, Card, ErrorText, Input, Label, Select, Textarea } from "@/components/ui";
import { FileIcon } from "@/components/icons";

export function SiteForm({
  site,
  customers,
  defaultCustomerId,
  action,
  submitLabel,
}: {
  site?: Site;
  customers?: Customer[];
  defaultCustomerId?: string;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, undefined);

  return (
    <Card className="p-5 max-w-xl">
      <form action={formAction} className="space-y-4">
        {customers && (
          <div>
            <Label htmlFor="customerId">Customer</Label>
            <Select id="customerId" name="customerId" defaultValue={defaultCustomerId ?? ""} required>
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="name">Site name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Head Office, Warehouse 2"
            defaultValue={site?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="address">Site address</Label>
          <Textarea id="address" name="address" rows={2} defaultValue={site?.address ?? ""} />
        </div>
        <div>
          <Label htmlFor="mapPdf">
            Site / floor plan {site?.mapPdfPath ? "(replace existing)" : ""}
          </Label>
          <Input id="mapPdf" name="mapPdf" type="file" accept="application/pdf" />
          {site?.mapPdfPath && (
            <a
              href={site.mapPdfPath}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
            >
              <FileIcon className="h-4 w-4" />
              View current plan
            </a>
          )}
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={site?.notes ?? ""} />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
