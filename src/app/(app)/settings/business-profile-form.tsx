"use client";

import { useActionState } from "react";
import { updateBusinessAction } from "@/lib/actions/business";
import type { ActionResult } from "@/lib/actions/auth";
import { Button, ErrorText, Input, Label, Textarea } from "@/components/ui";
import type { Business } from "@/generated/prisma/client";

export function BusinessProfileForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateBusinessAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="logo">Logo</Label>
        <Input id="logo" name="logo" type="file" accept="image/*" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Business name</Label>
          <Input id="name" name="name" defaultValue={business.name} required />
        </div>
        <div>
          <Label htmlFor="recNumber">REC / license number</Label>
          <Input id="recNumber" name="recNumber" defaultValue={business.recNumber ?? ""} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={business.email ?? ""} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={business.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="abn">ABN</Label>
          <Input id="abn" name="abn" defaultValue={business.abn ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Business address</Label>
        <Textarea id="address" name="address" rows={2} defaultValue={business.address ?? ""} />
      </div>
      <ErrorText>{state?.error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
