import Link from "next/link";

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Account suspended</h1>
        <p className="mt-2 text-sm text-slate-500">
          This business account has been suspended. Contact your platform provider to restore
          access.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
