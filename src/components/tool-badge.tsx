import type { ToolType } from "@/generated/prisma/client";

const TOOL_BADGE: Record<ToolType, { code: string; bg: string; text: string }> = {
  EXIT_EMERGENCY_LIGHTING: { code: "EXIT", bg: "bg-brand-100", text: "text-brand-800" },
  RCD_TESTING: { code: "RCD", bg: "bg-indigo-100", text: "text-indigo-700" },
};

export function ToolBadge({ toolType, className }: { toolType: ToolType; className?: string }) {
  const { code, bg, text } = TOOL_BADGE[toolType];
  return (
    <span
      className={`inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-wide ${bg} ${text} ${className ?? ""}`}
    >
      {code}
    </span>
  );
}
