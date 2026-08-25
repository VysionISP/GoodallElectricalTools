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
  green: "#157a3e",
  greenBg: "#e4f5eb",
  red: "#d93b47",
  redBg: "#fbe7e9",
  amber: "#b26e0a",
  amberBg: "#fdf0d9",
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

/* eslint-disable jsx-a11y/alt-text -- react-pdf's Image, not an <img> */

const letterheadStyles = StyleSheet.create({
  centeredWrap: { alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottomWidth: 2 },
  centeredLogos: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 6 },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: -36,
    marginTop: -36,
    marginBottom: 12,
    paddingHorizontal: 36,
    paddingVertical: 16,
  },
  bannerTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  bannerSub: { fontSize: 8, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  bannerLogoTile: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    padding: 4,
    marginLeft: 8,
  },
  bannerDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  minimalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 4,
  },
  minimalBizLine: { fontSize: 8, color: colors.slate, marginBottom: 14, marginTop: 4 },
  splitWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
  },
  splitCenter: { alignItems: "center", flex: 1, paddingHorizontal: 10 },
  customerLogo: { width: 54, height: 40, objectFit: "contain" },
  customerLogoPlaceholder: {
    width: 54,
    height: 40,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.faint,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { fontSize: 5.5, color: colors.faint, textAlign: "center" },
});

function CustomerLogo({
  customerLogoPath,
  placeholder,
}: {
  customerLogoPath?: string | null;
  placeholder?: boolean;
}) {
  if (customerLogoPath) {
    return <Image style={letterheadStyles.customerLogo} src={toAbsolute(customerLogoPath)!} />;
  }
  if (placeholder) {
    return (
      <View style={letterheadStyles.customerLogoPlaceholder}>
        <Text style={letterheadStyles.placeholderText}>Customer{"\n"}logo</Text>
      </View>
    );
  }
  return null;
}

/** The letterhead block used at the top of every report, in the resolved
 * template's chosen layout preset. `customerLogoPath` is the customer's own
 * logo (rendered only when the template enables it); `placeholderCustomerLogo`
 * makes the customer-logo slot visible as a dashed box when no logo exists —
 * used by the template preview so the slot's position is obvious. */
export function ReportLetterhead({
  business,
  title,
  subtitle,
  template,
  customerLogoPath,
  placeholderCustomerLogo,
}: {
  business: Business;
  title: string;
  subtitle: string;
  template: ResolvedTemplateConfig;
  customerLogoPath?: string | null;
  placeholderCustomerLogo?: boolean;
}) {
  const accent = template.accentColor;
  const generated = `Report generated ${formatDateTime(new Date())}`;
  const contactLine = [business.phone, business.email].filter(Boolean).join("   ·   ");
  const showCust = template.showCustomerLogo;
  const custLogo = showCust ? (
    <CustomerLogo customerLogoPath={customerLogoPath} placeholder={placeholderCustomerLogo} />
  ) : null;

  if (template.headerLayout === "centered") {
    return (
      <View style={[letterheadStyles.centeredWrap, { borderBottomColor: accent }]} fixed>
        <View style={letterheadStyles.centeredLogos}>
          {business.logoPath && <Image style={sharedStyles.logo} src={toAbsolute(business.logoPath)!} />}
          {custLogo}
        </View>
        <Text style={sharedStyles.businessName}>{business.name}</Text>
        {contactLine && <Text style={sharedStyles.businessLine}>{contactLine}</Text>}
        <Text style={[sharedStyles.reportTitle, { color: accent, marginTop: 6 }]}>{title}</Text>
        <Text style={sharedStyles.reportSub}>{subtitle}</Text>
        {template.headerText && <Text style={sharedStyles.reportSub}>{template.headerText}</Text>}
        <Text style={sharedStyles.reportSub}>{generated}</Text>
      </View>
    );
  }

  if (template.headerLayout === "banner") {
    return (
      <View fixed>
        <View style={[letterheadStyles.banner, { backgroundColor: accent }]}>
          <View>
            <Text style={letterheadStyles.bannerTitle}>{title}</Text>
            <Text style={letterheadStyles.bannerSub}>{subtitle}</Text>
            {template.headerText && <Text style={letterheadStyles.bannerSub}>{template.headerText}</Text>}
          </View>
          <View style={{ flexDirection: "row" }}>
            {business.logoPath && (
              <View style={letterheadStyles.bannerLogoTile}>
                <Image style={sharedStyles.logo} src={toAbsolute(business.logoPath)!} />
              </View>
            )}
            {custLogo && <View style={letterheadStyles.bannerLogoTile}>{custLogo}</View>}
          </View>
        </View>
        <View style={letterheadStyles.bannerDetails}>
          <View>
            <Text style={sharedStyles.businessName}>{business.name}</Text>
            <Text style={sharedStyles.businessLine}>
              {[business.address, contactLine, business.recNumber ? `REC No: ${business.recNumber}` : null]
                .filter(Boolean)
                .join("   ·   ")}
            </Text>
          </View>
          <Text style={sharedStyles.reportSub}>{generated}</Text>
        </View>
      </View>
    );
  }

  if (template.headerLayout === "minimal") {
    return (
      <View fixed>
        <View style={[letterheadStyles.minimalRow, { borderBottomColor: accent }]}>
          <View>
            <Text style={[sharedStyles.reportTitle, { color: accent }]}>{title}</Text>
            <Text style={sharedStyles.reportSub}>
              {subtitle}
              {template.headerText ? `   ·   ${template.headerText}` : ""}
            </Text>
          </View>
          <Text style={sharedStyles.reportSub}>{generated}</Text>
        </View>
        <Text style={letterheadStyles.minimalBizLine}>
          {[
            business.name,
            business.address,
            contactLine,
            business.recNumber ? `REC No: ${business.recNumber}` : null,
          ]
            .filter(Boolean)
            .join("   ·   ")}
        </Text>
      </View>
    );
  }

  if (template.headerLayout === "split") {
    return (
      <View style={[letterheadStyles.splitWrap, { borderBottomColor: accent }]} fixed>
        <View>
          {business.logoPath ? (
            <Image style={sharedStyles.logo} src={toAbsolute(business.logoPath)!} />
          ) : (
            <Text style={sharedStyles.businessName}>{business.name}</Text>
          )}
        </View>
        <View style={letterheadStyles.splitCenter}>
          <Text style={[sharedStyles.reportTitle, { color: accent }]}>{title}</Text>
          <Text style={sharedStyles.reportSub}>{subtitle}</Text>
          {template.headerText && <Text style={sharedStyles.reportSub}>{template.headerText}</Text>}
          <Text style={sharedStyles.reportSub}>
            {[business.name, contactLine].filter(Boolean).join("   ·   ")}
          </Text>
          <Text style={sharedStyles.reportSub}>{generated}</Text>
        </View>
        <View>{custLogo ?? <View style={{ width: 54 }} />}</View>
      </View>
    );
  }

  // classic (default)
  return (
    <View style={[sharedStyles.header, { borderBottomColor: accent }]} fixed>
      <View style={sharedStyles.headerLeft}>
        {business.logoPath && <Image style={sharedStyles.logo} src={toAbsolute(business.logoPath)!} />}
        <View>
          <Text style={sharedStyles.businessName}>{business.name}</Text>
          {business.address && <Text style={sharedStyles.businessLine}>{business.address}</Text>}
          <Text style={sharedStyles.businessLine}>{contactLine}</Text>
          {business.recNumber && <Text style={sharedStyles.businessLine}>REC No: {business.recNumber}</Text>}
        </View>
      </View>
      <View style={sharedStyles.headerRight}>
        {custLogo && <View style={{ marginBottom: 4 }}>{custLogo}</View>}
        <Text style={[sharedStyles.reportTitle, { color: accent }]}>{title}</Text>
        <Text style={sharedStyles.reportSub}>{subtitle}</Text>
        {template.headerText && <Text style={sharedStyles.reportSub}>{template.headerText}</Text>}
        <Text style={sharedStyles.reportSub}>{generated}</Text>
      </View>
    </View>
  );
}

export type InfoItem = { label: string; value: string; sub?: string | null };

/** The customer/site/test-details section under the letterhead, laid out to
 * match the template's header preset: boxes in a row (classic/banner/split),
 * centered boxes (centered), or compact single lines (minimal). */
export function ReportInfoSection({
  template,
  items,
}: {
  template: ResolvedTemplateConfig;
  items: InfoItem[];
}) {
  if (template.headerLayout === "minimal") {
    return (
      <View style={{ marginBottom: 14 }}>
        {items.map((item) => (
          <View key={item.label} style={{ flexDirection: "row", marginBottom: 3 }}>
            <Text style={[sharedStyles.infoLabel, { width: 70, marginBottom: 0 }]}>{item.label}</Text>
            <Text style={{ fontSize: 8.5, color: colors.ink }}>
              {item.value}
              {item.sub ? `  —  ${item.sub}` : ""}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  const centered = template.headerLayout === "centered";
  return (
    <View style={sharedStyles.infoRow}>
      {items.map((item) => (
        <View key={item.label} style={[sharedStyles.infoBox, centered ? { alignItems: "center" } : {}]}>
          <Text style={sharedStyles.infoLabel}>{item.label}</Text>
          <Text style={sharedStyles.infoValue}>{item.value}</Text>
          {item.sub && <Text style={sharedStyles.infoSub}>{item.sub}</Text>}
        </View>
      ))}
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
