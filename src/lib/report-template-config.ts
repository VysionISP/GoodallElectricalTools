import type { ToolType, ReportTemplate } from "@/generated/prisma/client";

// Matches the app's brand-700 token in globals.css.
export const DEFAULT_ACCENT_COLOR = "#0B2D5C";

export const ACCENT_SWATCHES = ["#0B2D5C", "#169CE8", "#20B25B", "#D93B47", "#0f172a"];

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

// Letterhead/header presets — different logo positions and info layouts.
export const HEADER_LAYOUTS = [
  {
    key: "classic",
    label: "Classic",
    description: "Business logo top-left, title on the right, info boxes in a row.",
  },
  {
    key: "centered",
    label: "Centered",
    description: "Logo and title centered, info boxes beneath.",
  },
  {
    key: "banner",
    label: "Banner",
    description: "Full-width accent banner with the title; logo sits inside the banner.",
  },
  {
    key: "minimal",
    label: "Minimal",
    description: "No header logo, compact single-line details — the quiet option.",
  },
  {
    key: "split",
    label: "Split branding",
    description: "Your logo left, the customer's logo right, title centered between.",
  },
] as const;

export type HeaderLayout = (typeof HEADER_LAYOUTS)[number]["key"];

export function parseHeaderLayout(raw: unknown): HeaderLayout {
  const found = HEADER_LAYOUTS.find((l) => l.key === raw);
  return found ? found.key : "classic";
}

export type ResolvedTemplateConfig = {
  accentColor: string;
  headerLayout: HeaderLayout;
  showStatCards: boolean;
  showPhotos: boolean;
  showCustomerLogo: boolean;
  columns: string[];
  headerText: string | null;
  footerText: string | null;
  disclaimerText: string | null;
};

export function defaultTemplateConfig(toolType: ToolType): ResolvedTemplateConfig {
  return {
    accentColor: DEFAULT_ACCENT_COLOR,
    headerLayout: "classic",
    showStatCards: true,
    showPhotos: true,
    showCustomerLogo: true,
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
    headerLayout: parseHeaderLayout(template.headerLayout),
    showStatCards: template.showStatCards,
    showPhotos: template.showPhotos,
    showCustomerLogo: template.showCustomerLogo,
    columns: parseTemplateColumns(toolType, template.tableColumns),
    headerText: template.headerText,
    footerText: template.footerText,
    disclaimerText: template.disclaimerText,
  };
}
