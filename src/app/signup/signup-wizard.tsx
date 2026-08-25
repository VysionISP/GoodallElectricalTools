"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { signupAction } from "@/lib/actions/auth";

// Full-bleed, one-question-at-a-time signup (email -> name -> business +
// password). Details stay in client state until the final step creates the
// account in one server action; the in-app onboarding wizard then collects
// the rest of the business profile.

export function SignupWizard() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const submitFinal = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("email", email);
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    setError(undefined);
    startTransition(async () => {
      const result = await signupAction(undefined, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-950 px-4">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-brand-950 text-sm font-bold">
            FC
          </div>
          <span className="text-sm font-semibold text-white">Field Compliance</span>
        </Link>
        <Link href="/login" className="text-sm font-medium text-brand-100/80 hover:text-white">
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center pb-24 text-center">
        <StepDots step={step} />

        {step === 0 && (
          <StepShell
            title="Let's get your business set up."
            subtitle="Start with the email you'll sign in with."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(1);
              }}
              className="space-y-3"
            >
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <BigButton type="submit">Next</BigButton>
            </form>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="Nice to meet you." subtitle="Who's setting this up?">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="space-y-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <BigButton type="submit">Next</BigButton>
              <BackLink onClick={() => setStep(0)} />
            </form>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title={`Almost there, ${firstName || "legend"}.`}
            subtitle="Name your business and pick a password."
          >
            <form onSubmit={submitFinal} className="space-y-3">
              <input
                name="businessName"
                required
                autoFocus
                placeholder="Business name"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Password (8+ characters)"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {error && <p className="text-sm font-medium text-red-300">{error}</p>}
              <BigButton type="submit" disabled={pending}>
                {pending ? "Creating your account..." : "Create my account"}
              </BigButton>
              <BackLink onClick={() => setStep(1)} />
            </form>
          </StepShell>
        )}

        <p className="mt-8 text-xs text-brand-100/50">
          Self-hosted for your business — your data stays on your server.
        </p>
      </main>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
      <p className="mt-2 text-base text-brand-100/70">{subtitle}</p>
      <div className="mx-auto mt-8 w-full max-w-md text-left">{children}</div>
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === step ? "w-8 bg-brand-400" : i < step ? "w-4 bg-brand-600" : "w-4 bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

function BigButton({
  children,
  type,
  disabled,
}: {
  children: ReactNode;
  type: "submit" | "button";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full rounded-xl bg-brand-500 px-4 py-3.5 text-base font-semibold text-brand-950 hover:bg-brand-400 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full pt-1 text-center text-sm font-medium text-brand-100/60 hover:text-white"
    >
      Back
    </button>
  );
}
