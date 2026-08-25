"use client";

import { useActionState, useState, useTransition } from "react";
import type { Business } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import {
  finishOnboardingAction,
  saveOnboardingComplianceAction,
  saveOnboardingContactAction,
} from "@/lib/actions/onboarding";
import { Button, Card, ErrorText, Input, Label, Textarea } from "@/components/ui";

const STEPS = ["Business details", "Branding & compliance", "Get started"];

export function OnboardingWizard({ business }: { business: Business }) {
  const [step, setStep] = useState(0);

  return (
    <div>
      <ol className="mb-5 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                i < step
                  ? "bg-brand-600 text-white"
                  : i === step
                    ? "bg-brand-100 text-brand-800 ring-2 ring-brand-500"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i === step ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-slate-200" />}
          </li>
        ))}
      </ol>

      {step === 0 && <ContactStep business={business} onDone={() => setStep(1)} />}
      {step === 1 && <ComplianceStep business={business} onDone={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <FinishStep onBack={() => setStep(1)} />}
    </div>
  );
}

function ContactStep({ business, onDone }: { business: Business; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const result = await saveOnboardingContactAction(prev, formData);
      if (!result?.error) onDone();
      return result;
    },
    undefined
  );

  return (
    <Card className="p-5">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">Business name</Label>
          <Input id="name" name="name" defaultValue={business.name} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Business email</Label>
            <Input id="email" name="email" type="email" defaultValue={business.email ?? ""} placeholder="office@yourbusiness.com.au" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={business.phone ?? ""} placeholder="03 9000 0000" />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Business address</Label>
          <Textarea id="address" name="address" rows={2} defaultValue={business.address ?? ""} />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <Button type="submit" className="w-full justify-center" disabled={pending}>
          {pending ? "Saving..." : "Continue"}
        </Button>
      </form>
    </Card>
  );
}

function ComplianceStep({
  business,
  onDone,
  onBack,
}: {
  business: Business;
  onDone: () => void;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const result = await saveOnboardingComplianceAction(prev, formData);
      if (!result?.error) onDone();
      return result;
    },
    undefined
  );

  return (
    <Card className="p-5">
      <p className="mb-4 text-sm text-slate-500">
        These appear on your PDF reports. All optional — you can add or change them later in
        Settings.
      </p>
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="recNumber">REC / licence number</Label>
            <Input id="recNumber" name="recNumber" defaultValue={business.recNumber ?? ""} placeholder="REC 12345" />
          </div>
          <div>
            <Label htmlFor="abn">ABN</Label>
            <Input id="abn" name="abn" defaultValue={business.abn ?? ""} placeholder="00 000 000 000" />
          </div>
        </div>
        <div>
          <Label htmlFor="logo">Business logo</Label>
          <Input id="logo" name="logo" type="file" accept="image/*" />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1 justify-center" disabled={pending}>
            {pending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FinishStep({ onBack }: { onBack: () => void }) {
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState<string | null>(null);

  const pick = (c: "customer" | "demo" | "skip") => {
    setChoice(c);
    startTransition(() => finishOnboardingAction(c));
  };

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-slate-900">You&apos;re set up. How do you want to start?</h2>
      <div className="mt-4 space-y-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => pick("demo")}
          className="w-full rounded-xl border border-brand-300 bg-brand-50 p-4 text-left hover:border-brand-500 disabled:opacity-60"
        >
          <p className="text-sm font-semibold text-brand-900">
            {pending && choice === "demo" ? "Loading demo data..." : "Look around with demo data"}
          </p>
          <p className="mt-0.5 text-xs text-brand-800/70">
            We&apos;ll load a demo customer, a site with fittings and RCDs, and completed tests —
            including a failed fitting so you can see reports and works required. One click removes
            it all when you&apos;re done.
          </p>
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => pick("customer")}
          className="w-full rounded-xl border border-slate-200 p-4 text-left hover:border-brand-300 disabled:opacity-60"
        >
          <p className="text-sm font-semibold text-slate-900">
            {pending && choice === "customer" ? "Finishing..." : "Add my first customer"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Jump straight in: create a real customer, then their site and fittings.
          </p>
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <button
          type="button"
          disabled={pending}
          onClick={() => pick("skip")}
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          {pending && choice === "skip" ? "Finishing..." : "Skip for now"}
        </button>
      </div>
    </Card>
  );
}
