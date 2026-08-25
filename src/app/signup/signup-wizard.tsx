"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { signupAction } from "@/lib/actions/auth";
import { saveSignupLeadAction } from "@/lib/actions/signup-leads";

// Full-bleed, one-question-at-a-time signup (email -> name & mobile ->
// business name & ABN -> password). Each completed step also saves what's
// known so far as a signup lead, so an abandoned signup still leaves the
// platform owner a contact to follow up; finishing signup removes the lead.

export function SignupWizard() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState<string | undefined>();
  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const submitFinal = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("email", email);
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("mobile", mobile);
    formData.set("businessName", businessName);
    formData.set("abn", abn);
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Passwords don't match.");
      return;
    }
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
                // Fire-and-forget lead capture — never hold up the visitor.
                void saveSignupLeadAction({ email });
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
                if (!isValidMobile(mobile)) {
                  setMobileError("Enter a valid mobile number — digits only, e.g. 0400 123 456.");
                  return;
                }
                setMobileError(undefined);
                void saveSignupLeadAction({ email, firstName, lastName, mobile });
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
              <input
                type="tel"
                required
                inputMode="tel"
                value={mobile}
                onChange={(e) => {
                  // Phone characters only — digits, spaces, +, brackets, dashes.
                  setMobile(e.target.value.replace(/[^0-9+\-() ]/g, ""));
                  setMobileError(undefined);
                }}
                placeholder="Mobile number"
                autoComplete="tel"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {mobileError && <p className="text-sm font-medium text-red-300">{mobileError}</p>}
              <BigButton type="submit">Next</BigButton>
              <BackLink onClick={() => setStep(0)} />
            </form>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Tell us about the business." subtitle="This goes on your reports.">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveSignupLeadAction({ email, firstName, lastName, mobile, businessName });
                setStep(3);
              }}
              className="space-y-3"
            >
              <input
                required
                autoFocus
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                placeholder="ABN (optional)"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <BigButton type="submit">Next</BigButton>
              <BackLink onClick={() => setStep(1)} />
            </form>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title={`Almost there, ${firstName || "legend"}.`}
            subtitle="Pick a password to secure your account."
          >
            <form onSubmit={submitFinal} className="space-y-3">
              <input
                name="password"
                type="password"
                required
                autoFocus
                minLength={8}
                autoComplete="new-password"
                placeholder="Password (8+ characters)"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirm password"
                className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {error && <p className="text-sm font-medium text-red-300">{error}</p>}
              <BigButton type="submit" disabled={pending}>
                {pending ? "Creating your account..." : "Create my account"}
              </BigButton>
              <BackLink onClick={() => setStep(2)} />
            </form>
          </StepShell>
        )}

        <p className="mt-8 text-xs text-brand-100/50">
          Your business&apos;s data is private to your team — nobody else on the platform sees it.
        </p>
      </main>
    </div>
  );
}

/** Phone-shaped: only phone characters, and at least 8 actual digits. */
function isValidMobile(value: string) {
  return /^[0-9+\-() ]+$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 8;
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
      {[0, 1, 2, 3].map((i) => (
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
