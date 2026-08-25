"use client";

import { useActionState } from "react";
import type { Customer } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { Button, Card, ErrorText, Input, Label, Textarea } from "@/components/ui";

export function CustomerForm({
  customer,
  action,
  submitLabel,
}: {
  customer?: Customer;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, undefined);

  return (
    <Card className="p-5 max-w-xl">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">Customer / business name</Label>
          <Input id="name" name="name" defaultValue={customer?.name} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactName">Contact name</Label>
            <Input id="contactName" name="contactName" defaultValue={customer?.contactName ?? ""} />
          </div>
          <div>
            <Label htmlFor="contactPhone">Contact phone</Label>
            <Input id="contactPhone" name="contactPhone" defaultValue={customer?.contactPhone ?? ""} />
          </div>
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={customer?.contactEmail ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={customer?.notes ?? ""} />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
