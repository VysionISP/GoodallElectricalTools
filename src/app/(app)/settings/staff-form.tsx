"use client";

import { useActionState } from "react";
import { createStaffAction, removeStaffAction } from "@/lib/actions/business";
import type { ActionResult } from "@/lib/actions/auth";
import { Button, ErrorText, Input, Label, Select } from "@/components/ui";
import { TrashIcon } from "@/components/icons";

export function StaffForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createStaffAction,
    undefined
  );

  return (
    <form action={formAction} className="border-t border-slate-100 pt-5 space-y-4">
      <p className="text-sm font-medium text-slate-700">Add staff member</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="staffName">Name</Label>
          <Input id="staffName" name="name" required />
        </div>
        <div>
          <Label htmlFor="staffRole">Role</Label>
          <Select id="staffRole" name="role" defaultValue="TECHNICIAN">
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="staffEmail">Email</Label>
          <Input id="staffEmail" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="staffPassword">Temporary password</Label>
          <Input id="staffPassword" name="password" type="text" minLength={8} required />
        </div>
      </div>
      <ErrorText>{state?.error}</ErrorText>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding..." : "Add staff member"}
      </Button>
    </form>
  );
}

export function RemoveStaffButton({ userId }: { userId: string }) {
  return (
    <form action={removeStaffAction.bind(null, userId)}>
      <button
        type="submit"
        aria-label="Remove staff member"
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
