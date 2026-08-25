"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type ActionResult } from "@/lib/actions/auth";
import { Button, Card, ErrorText, Input, Label } from "@/components/ui";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    signupAction,
    undefined
  );

  return (
    <Card className="p-6">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" name="businessName" required />
        </div>
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create business account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
