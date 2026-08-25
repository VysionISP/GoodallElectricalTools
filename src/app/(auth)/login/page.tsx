"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionResult } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    loginAction,
    undefined
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Welcome back.</h1>
      <p className="mt-2 text-base text-brand-100/70">Sign in to pick up where you left off.</p>

      <form action={formAction} className="mx-auto mt-8 w-full max-w-md space-y-3 text-left">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="Email address"
          className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-electric"
        />
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-electric"
        />
        {state?.error && <p className="text-sm font-medium text-red-300">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-electric px-4 py-3.5 text-base font-semibold text-brand-950 hover:bg-electric-400 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-brand-100/60">
        New business?{" "}
        <Link href="/signup" className="font-medium text-brand-300 hover:text-white">
          Create an account
        </Link>
      </p>
    </div>
  );
}
