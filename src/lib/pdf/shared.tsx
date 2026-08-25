import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Business } from "@/generated/prisma/client";
import { UPLOAD_ROOT } from "@/lib/upload";
import { formatDateTime } from "@/lib/format";
import type { ResolvedTemplateConfig } from "@/lib/report-template-config";
import path from "path";

export const colors = {
  ink: "#0f172a",
  slate: "#475569",
  faint: "#94a3b8",
  border: "#e2e8f0",
  green: "#166534",
  greenBg: "#dcfce7",
  red: "#b91c1c",
  redBg: "#fee2e2",
  amber: "#92400e",
  amberBg: "#fef3c7",
};

export const TYPE_LABELS: Record<string, string> = {
  EXIT_SIGN: "Exit sign",
  EMERGENCY_LIGHT: "Emergency light",
  COMBINED: "Combined",
};

const UPLOADS_URL_PREFIX = "/api/uploads/";

/** Resolves a stored upload URL (e.g. "/api/uploads/<biz>/...") to an
 * absolute filesystem path react-pdf's <Image> can read directly. */
export function toAbsolute(uploadUrl: string | null | undefined) {
  if (!uploadUrl?.startsWith(UPLOADS_URL_PREFIX)) return undefined;
  return path.join(UPLOAD_ROOT, uploadUrl.slice(UPLOADS_URL_PREFIX.length));
}

/** Styles shared by every branded PDF report: page, letterhead header, info
 * cards, table chrome, and footer. Document-specific styles are merged on
 * top of these via StyleSheet.create in each report component. Accent color
 * (header rule, title) is applied inline per-render from the resolved
 * template, not baked in here. */
export const sharedStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: colors.ink,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 2,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 42, height: 42, objectFit: "contain" },
  businessName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: colors.ink },
  businessLine: { fontSize: 8, color: colors.slate, marginTop: 1 },
  headerRight: { alignItems: "flex-end" },
  reportTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  reportSub: { fontSize: 8, color: colors.faint, marginTop: 2 },

  infoRow: { flexDirection: "row", marginBottom: 16, gap: 10 },
  infoBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  infoLabel: { fontSize: 7.5, color: colors.faint, textTransform: "uppercase", marginBottom: 3 },
  infoValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: colors.ink },
  infoSub: { fontSize: 8.5, color: colors.slate, marginTop: 1 },

  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    marginBottom: 6,
    marginTop: 4,
  },

  table: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, overflow: "hidden" },
  tHeadRow: { flexDirection: "row", backgroundColor: "#f1f5f9" },
  tRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border },
  th: { padding: 5, fontSize: 7.5, fontFamily: "Helvetica-Bold", color: colors.slate },
  td: { padding: 5, fontSize: 8.5, color: colors.ink },

  pill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: colors.faint,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },

  disclaimer: {
    marginTop: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    fontSize: 7.5,
    color: colors.slate,
  },
});

/** The letterhead block used at the top of every report: logo/business
 * details on the left, report title + optional custom header line on the
 * right, colored by the resolved template's accent color. */
export function ReportLetterhead({
  business,
  title,
  subtitle,
  template,
}: {
  business: Business;
  title: string;
  subtitle: string;
  template: ResolvedTemplateConfig;
}) {
  return (
    <View style={[sharedStyles.header, { borderBottomColor: template.accentColor }]} fixed>
      <View style={sharedStyles.headerLeft}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img> */}
        {business.logoPath && <Image style={sharedStyles.logo} src={toAbsolute(business.logoPath)!} />}
        <View>
          <Text style={sharedStyles.businessName}>{business.name}</Text>
          {business.address && <Text style={sharedStyles.businessLine}>{business.address}</Text>}
          <Text style={sharedStyles.businessLine}>
            {[business.phone, business.email].filter(Boolean).join("   ·   ")}
          </Text>
          {business.recNumber && <Text style={sharedStyles.businessLine}>REC No: {business.recNumber}</Text>}
        </View>
      </View>
      <View style={sharedStyles.headerRight}>
        <Text style={[sharedStyles.reportTitle, { color: template.accentColor }]}>{title}</Text>
        <Text style={sharedStyles.reportSub}>{subtitle}</Text>
        {template.headerText && <Text style={sharedStyles.reportSub}>{template.headerText}</Text>}
        <Text style={sharedStyles.reportSub}>Report generated {formatDateTime(new Date())}</Text>
      </View>
    </View>
  );
}

/** The footer line used at the bottom of every report: the template's
 * custom footer text if set, else the default business/REC/ABN line. */
export function ReportFooter({ business, template }: { business: Business; template: ResolvedTemplateConfig }) {
  return (
    <View style={sharedStyles.footer} fixed>
      <Text>
        {template.footerText ??
          `${business.name}${business.recNumber ? ` · REC ${business.recNumber}` : ""}${business.abn ? ` · ABN ${business.abn}` : ""}`}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

export function ReportDisclaimer({ template }: { template: ResolvedTemplateConfig }) {
  if (!template.disclaimerText) return null;
  return (
    <View style={sharedStyles.disclaimer} wrap={false}>
      <Text>{template.disclaimerText}</Text>
    </View>
  );
}
