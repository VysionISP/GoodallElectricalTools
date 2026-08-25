import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white font-bold text-lg">
            FC
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Field Compliance</h1>
          <p className="text-sm text-slate-500">Electrical testing & reporting</p>
        </div>
        {children}
      </div>
    </div>
  );
}
