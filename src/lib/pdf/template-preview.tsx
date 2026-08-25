import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Business, ToolType } from "@/generated/prisma/client";
import { colors, sharedStyles, ReportLetterhead, ReportInfoSection, ReportFooter, ReportDisclaimer } from "@/lib/pdf/shared";
import type { ResolvedTemplateConfig } from "@/lib/report-template-config";

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 10, borderRadius: 4, alignItems: "center" },
  summaryValue: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  summaryLabel: { fontSize: 7.5, marginTop: 2, textTransform: "uppercase" },

  colRef: { width: "14%" },
  colLoc: { width: "22%" },
  colType: { width: "16%" },
  colExtra: { width: "14%" },
  colResult: { width: "16%" },

  repairCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  repairHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  repairTitle: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  repairNotes: { fontSize: 8.5, color: colors.slate, marginBottom: 6 },
  photoRow: { flexDirection: "row", gap: 8 },
  photoBox: {
    flex: 1,
    height: 90,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  photoBoxText: { fontSize: 7.5, color: colors.faint },
  photoLabel: { fontSize: 7, color: colors.faint, marginTop: 2, textAlign: "center" },
});

const EXIT_ROWS = [
  { ref: "EL-01", location: "Front foyer", type: "Emergency light", extra: "180ms", result: "PASS" },
  { ref: "EL-02", location: "Level 1 stairwell", type: "Exit sign", extra: "—", result: "NEEDS_REPAIR" },
  { ref: "EL-03", location: "Rear fire exit", type: "Combined", extra: "—", result: "PASS" },
];

const RCD_ROWS = [
  { ref: "SB1-RCD1", location: "Main switchboard", type: "Type A 30mA", extra: "180ms / 22ms", result: "PASS" },
  { ref: "SB1-RCD2", location: "Kitchen circuit", type: "Type A 30mA", extra: "450ms / 90ms", result: "NEEDS_REPAIR" },
  { ref: "SB2-RCD1", location: "Workshop", type: "Type AC 30mA", extra: "150ms / 18ms", result: "PASS" },
];

const EXIT_COLUMN_STYLES: Record<string, object> = {
  location: styles.colLoc,
  type: styles.colType,
  comments: styles.colExtra,
};

const RCD_COLUMN_STYLES: Record<string, object> = {
  location: styles.colLoc,
  type: styles.colType,
  tripRated: styles.colExtra,
  trip5x: styles.colExtra,
  button: styles.colExtra,
};

function resultPillStyle(result: string) {
  if (result === "PASS") return { backgroundColor: colors.greenBg, color: colors.green };
  if (result === "FAIL") return { backgroundColor: colors.redBg, color: colors.red };
  return { backgroundColor: colors.amberBg, color: colors.amber };
}

function resultLabel(result: string) {
  if (result === "PASS") return "Pass";
  if (result === "FAIL") return "Fail";
  return "Needs repair";
}

/** Renders a report using fixed sample data so a template's layout/style
 * choices can be previewed before saving — without needing real jobs,
 * fittings or uploaded photos to exist yet. */
export function TemplatePreviewDocument({
  business,
  toolType,
  template,
}: {
  business: Business;
  toolType: ToolType;
  template: ResolvedTemplateConfig;
}) {
  const isRcd = toolType === "RCD_TESTING";
  const rows = isRcd ? RCD_ROWS : EXIT_ROWS;
  const columnStyles = isRcd ? RCD_COLUMN_STYLES : EXIT_COLUMN_STYLES;
  const columns = template.columns.filter((c) => c in columnStyles);
  const extraLabel = isRcd ? "Trip @1x / @5x" : "Comments";
  const repairRow = rows.find((r) => r.result !== "PASS")!;

  return (
    <Document title="Template Preview" author={business.name}>
      <Page size="A4" style={sharedStyles.page} wrap={false}>
        <ReportLetterhead
          business={business}
          title={isRcd ? "RCD / Safety Switch Test Report" : "Emergency & Exit Lighting Test Report"}
          subtitle="Preview — sample data"
          template={template}
          placeholderCustomerLogo
        />

        <ReportInfoSection
          template={template}
          items={[
            { label: "Customer", value: "Sample Customer Pty Ltd" },
            { label: "Site", value: "123 Example Street" },
            { label: "Test details", value: "25 Aug 2026", sub: "Technician: Sample Technician" },
          ]}
        />

        {template.showStatCards && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#f1f5f9" }]}>
              <Text style={[styles.summaryValue, { color: colors.ink }]}>{rows.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.slate }]}>Tested</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.greenBg }]}>
              <Text style={[styles.summaryValue, { color: colors.green }]}>
                {rows.filter((r) => r.result === "PASS").length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.green }]}>Pass</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.amberBg }]}>
              <Text style={[styles.summaryValue, { color: colors.amber }]}>
                {rows.filter((r) => r.result === "NEEDS_REPAIR").length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.amber }]}>Needs repair</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.redBg }]}>
              <Text style={[styles.summaryValue, { color: colors.red }]}>
                {rows.filter((r) => r.result === "FAIL").length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.red }]}>Fail</Text>
            </View>
          </View>
        )}

        <Text style={sharedStyles.sectionTitle}>{isRcd ? "RCD Test Results" : "Fitting Test Results"}</Text>
        <View style={sharedStyles.table}>
          <View style={sharedStyles.tHeadRow}>
            <Text style={[sharedStyles.th, styles.colRef]}>Ref</Text>
            {columns.includes("location") && <Text style={[sharedStyles.th, styles.colLoc]}>Location</Text>}
            {columns.includes("type") && <Text style={[sharedStyles.th, styles.colType]}>Type</Text>}
            {columns.some((c) => c !== "location" && c !== "type") && (
              <Text style={[sharedStyles.th, styles.colExtra]}>{extraLabel}</Text>
            )}
            <Text style={[sharedStyles.th, styles.colResult]}>Result</Text>
          </View>
          {rows.map((r) => (
            <View style={sharedStyles.tRow} key={r.ref} wrap={false}>
              <Text style={[sharedStyles.td, styles.colRef]}>{r.ref}</Text>
              {columns.includes("location") && <Text style={[sharedStyles.td, styles.colLoc]}>{r.location}</Text>}
              {columns.includes("type") && <Text style={[sharedStyles.td, styles.colType]}>{r.type}</Text>}
              {columns.some((c) => c !== "location" && c !== "type") && (
                <Text style={[sharedStyles.td, styles.colExtra]}>{r.extra}</Text>
              )}
              <View style={[styles.colResult, { padding: 5 }]}>
                <Text style={[sharedStyles.pill, resultPillStyle(r.result)]}>{resultLabel(r.result)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View break={false} style={{ marginTop: 16 }}>
          <Text style={sharedStyles.sectionTitle}>Repairs Required</Text>
          <View style={styles.repairCard} wrap={false}>
            <View style={styles.repairHeaderRow}>
              <Text style={styles.repairTitle}>
                {repairRow.ref} — {repairRow.location}
              </Text>
              <Text style={[sharedStyles.pill, resultPillStyle(repairRow.result)]}>{resultLabel(repairRow.result)}</Text>
            </View>
            <Text style={styles.repairNotes}>Sample repair note describing what needs fixing.</Text>
            {template.showPhotos && (
              <View style={styles.photoRow}>
                <View style={styles.photoBox}>
                  <Text style={styles.photoBoxText}>Sample before photo</Text>
                </View>
                <View style={styles.photoBox}>
                  <Text style={styles.photoBoxText}>Sample after photo</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <ReportDisclaimer template={template} />
        <ReportFooter business={business} template={template} />
      </Page>
    </Document>
  );
}
