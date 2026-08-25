import type { ToolType, ReportTemplate } from "@/generated/prisma/client";

// Matches the app's brand-700 token in globals.css.
export const DEFAULT_ACCENT_COLOR = "#047857";

export const ACCENT_SWATCHES = ["#047857", "#1d4ed8", "#7c3aed", "#b91c1c", "#0f172a"];

export const COLUMN_DEFS: Record<ToolType, { key: string; label: string }[]> = {
  EXIT_EMERGENCY_LIGHTING: [
    { key: "location", label: "Location" },
    { key: "type", label: "Fitting type" },
    { key: "comments", label: "Comments" },
  ],
  RCD_TESTING: [
    { key: "location", label: "Location" },
    { key: "type", label: "RCD type / rating" },
    { key: "tripRated", label: "Trip time @ 1x rated" },
    { key: "trip5x", label: "Trip time @ 5x rated" },
    { key: "button", label: "Push-button test" },
  ],
};

const DEFAULT_COLUMNS: Record<ToolType, string[]> = {
  EXIT_EMERGENCY_LIGHTING: COLUMN_DEFS.EXIT_EMERGENCY_LIGHTING.map((c) => c.key),
  RCD_TESTING: COLUMN_DEFS.RCD_TESTING.map((c) => c.key),
};

export type ResolvedTemplateConfig = {
  accentColor: string;
  showStatCards: boolean;
  showPhotos: boolean;
  columns: string[];
  headerText: string | null;
  footerText: string | null;
  disclaimerText: string | null;
};

export function defaultTemplateConfig(toolType: ToolType): ResolvedTemplateConfig {
  return {
    accentColor: DEFAULT_ACCENT_COLOR,
    showStatCards: true,
    showPhotos: true,
    columns: DEFAULT_COLUMNS[toolType],
    headerText: null,
    footerText: null,
    disclaimerText: null,
  };
}

export function parseTemplateColumns(toolType: ToolType, raw: unknown): string[] {
  const allowed = new Set(DEFAULT_COLUMNS[toolType]);
  if (!Array.isArray(raw)) return DEFAULT_COLUMNS[toolType];
  const filtered = raw.filter((v): v is string => typeof v === "string" && allowed.has(v));
  return filtered.length > 0 ? filtered : DEFAULT_COLUMNS[toolType];
}

export function toResolvedConfig(
  toolType: ToolType,
  template: ReportTemplate | null | undefined
): ResolvedTemplateConfig {
  if (!template) return defaultTemplateConfig(toolType);
  return {
    accentColor: template.accentColor || DEFAULT_ACCENT_COLOR,
    showStatCards: template.showStatCards,
    showPhotos: template.showPhotos,
    columns: parseTemplateColumns(toolType, template.tableColumns),
    headerText: template.headerText,
    footerText: template.footerText,
    disclaimerText: template.disclaimerText,
  };
}
