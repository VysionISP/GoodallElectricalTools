import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui";
import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Business branding, report templates, contact details and staff accounts."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
