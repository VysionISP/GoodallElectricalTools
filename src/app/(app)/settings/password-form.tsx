"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/lib/actions/business";
import type { ActionResult } from "@/lib/actions/auth";
import { Button, ErrorText, Input, Label } from "@/components/ui";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updatePasswordAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
      </div>
      <ErrorText>{state?.error}</ErrorText>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
