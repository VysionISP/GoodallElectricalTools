import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui";
import { requirePlatformAdmin } from "@/lib/session";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requirePlatformAdmin();

  return (
    <div>
      <PageHeader
        title="Platform admin"
        description="Manage the businesses using this platform and the shared device catalogue."
      />
      <AdminNav />
      {children}
    </div>
  );
}
