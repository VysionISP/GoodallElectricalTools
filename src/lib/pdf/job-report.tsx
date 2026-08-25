import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type {
  Business,
  Customer,
  Fitting,
  FittingModel,
  FittingTestResult,
  Job,
  Site,
  User,
} from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import { colors, sharedStyles, toAbsolute, TYPE_LABELS, ReportLetterhead, ReportInfoSection, ReportFooter, ReportDisclaimer } from "@/lib/pdf/shared";
import { defaultTemplateConfig, type ResolvedTemplateConfig } from "@/lib/report-template-config";

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  summaryValue: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  summaryLabel: { fontSize: 7.5, marginTop: 2, textTransform: "uppercase" },

  colRef: { width: "16%" },
  colLoc: { width: "30%" },
  colType: { width: "18%" },
  colResult: { width: "18%" },
  colComment: { width: "18%" },

  repairCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  repairHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  repairTitle: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  repairModel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: colors.ink, marginBottom: 4 },
  repairNotes: { fontSize: 8.5, color: colors.slate, marginBottom: 6 },
  photoRow: { flexDirection: "row", gap: 8 },
  photoBox: { flex: 1 },
  photoImg: { width: "100%", height: 110, objectFit: "cover", borderRadius: 3 },
  photoLabel: { fontSize: 7, color: colors.faint, marginTop: 2, textAlign: "center" },
});

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

const TEST_TYPE_LABELS: Record<string, string> = {
  SIX_MONTHLY_DISCHARGE: "6-Monthly Discharge Test",
  ANNUAL_FULL_TEST: "Annual Full Test",
};

// Column widths are fixed above (colLoc/colType/colComment sum to 66%) so the
// three optional columns share the row evenly regardless of which are shown.
const COLUMN_STYLES: Record<string, object> = {
  location: styles.colLoc,
  type: styles.colType,
  comments: styles.colComment,
};

type FittingWithResult = Fitting & { result?: FittingTestResult; model?: FittingModel | null };

export function JobReportDocument({
  business,
  customer,
  site,
  job,
  technician,
  fittings,
  template = defaultTemplateConfig("EXIT_EMERGENCY_LIGHTING"),
}: {
  business: Business;
  customer: Customer;
  site: Site;
  job: Job;
  technician: User | null;
  fittings: FittingWithResult[];
  template?: ResolvedTemplateConfig;
}) {
  // A result row can exist purely from the pre-test energised walkthrough
  // (before the discharge test itself has run), so "tested" means the
  // discharge result was actually recorded, not just that a row exists.
  const tested = fittings.filter((f) => f.result?.durationTestPass != null);
  const passCount = tested.filter((f) => f.result!.overallResult === "PASS").length;
  const failCount = tested.filter((f) => f.result!.overallResult === "FAIL").length;
  const repairCount = tested.filter((f) => f.result!.overallResult === "NEEDS_REPAIR").length;
  const needsAttention = fittings.filter(
    (f) => f.result?.durationTestPass != null && f.result.overallResult !== "PASS"
  );
  const columns = template.columns.filter((c) => c in COLUMN_STYLES);

  return (
    <Document
      title={`${site.name} - Emergency Lighting Test Report`}
      author={business.name}
    >
      <Page size="A4" style={sharedStyles.page} wrap>
        <ReportLetterhead
          business={business}
          title="Emergency & Exit Lighting Test Report"
          subtitle={TEST_TYPE_LABELS[job.testType ?? "SIX_MONTHLY_DISCHARGE"]}
          template={template}
          customerLogoPath={customer.logoPath}
        />

        <ReportInfoSection
          template={template}
          items={[
            { label: "Customer", value: customer.name, sub: customer.contactName },
            { label: "Site", value: site.name, sub: site.address },
            {
              label: "Test details",
              value: job.completedDate ? formatDate(job.completedDate) : formatDate(job.createdAt),
              sub: `Technician: ${technician?.name ?? "—"}`,
            },
          ]}
        />

        {template.showStatCards && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#f1f5f9" }]}>
              <Text style={[styles.summaryValue, { color: colors.ink }]}>{fittings.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.slate }]}>Fittings tested</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.greenBg }]}>
              <Text style={[styles.summaryValue, { color: colors.green }]}>{passCount}</Text>
              <Text style={[styles.summaryLabel, { color: colors.green }]}>Pass</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.amberBg }]}>
              <Text style={[styles.summaryValue, { color: colors.amber }]}>{repairCount}</Text>
              <Text style={[styles.summaryLabel, { color: colors.amber }]}>Needs repair</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.redBg }]}>
              <Text style={[styles.summaryValue, { color: colors.red }]}>{failCount}</Text>
              <Text style={[styles.summaryLabel, { color: colors.red }]}>Fail</Text>
            </View>
          </View>
        )}

        <Text style={sharedStyles.sectionTitle}>Fitting Test Results</Text>
        <View style={sharedStyles.table}>
          <View style={sharedStyles.tHeadRow}>
            <Text style={[sharedStyles.th, styles.colRef]}>Ref</Text>
            {columns.includes("location") && <Text style={[sharedStyles.th, styles.colLoc]}>Location</Text>}
            {columns.includes("type") && <Text style={[sharedStyles.th, styles.colType]}>Type</Text>}
            <Text style={[sharedStyles.th, styles.colResult]}>Result</Text>
            {columns.includes("comments") && <Text style={[sharedStyles.th, styles.colComment]}>Comments</Text>}
          </View>
          {fittings.map((f) => (
            <View style={sharedStyles.tRow} key={f.id} wrap={false}>
              <Text style={[sharedStyles.td, styles.colRef]}>{f.reference}</Text>
              {columns.includes("location") && <Text style={[sharedStyles.td, styles.colLoc]}>{f.location}</Text>}
              {columns.includes("type") && (
                <Text style={[sharedStyles.td, styles.colType]}>{TYPE_LABELS[f.fittingType]}</Text>
              )}
              <View style={[styles.colResult, { padding: 5 }]}>
                {f.result?.durationTestPass != null ? (
                  <Text style={[sharedStyles.pill, resultPillStyle(f.result.overallResult)]}>
                    {resultLabel(f.result.overallResult)}
                  </Text>
                ) : (
                  <Text style={[sharedStyles.pill, { backgroundColor: "#f1f5f9", color: colors.faint }]}>
                    Not tested
                  </Text>
                )}
              </View>
              {columns.includes("comments") && (
                <Text style={[sharedStyles.td, styles.colComment]}>{f.result?.comments ?? ""}</Text>
              )}
            </View>
          ))}
        </View>

        {needsAttention.length > 0 && (
          <View break>
            <Text style={sharedStyles.sectionTitle}>Works Required</Text>
            {needsAttention.map((f) => (
              <View style={styles.repairCard} key={f.id} wrap={false}>
                <View style={styles.repairHeaderRow}>
                  <Text style={styles.repairTitle}>
                    {f.reference} — {f.location}
                  </Text>
                  <Text style={[sharedStyles.pill, resultPillStyle(f.result!.overallResult)]}>
                    {resultLabel(f.result!.overallResult)}
                  </Text>
                </View>
                <Text style={styles.repairModel}>
                  {f.model
                    ? `Replacement unit: ${f.model.brand} ${f.model.model}`
                    : "Replacement unit: model not recorded for this fitting"}
                  {f.installedDate ? `  ·  Installed ${formatDate(f.installedDate)}` : ""}
                </Text>
                {f.result?.repairNotes && (
                  <Text style={styles.repairNotes}>{f.result.repairNotes}</Text>
                )}
                {template.showPhotos && (f.result?.beforePhotoPath || f.result?.afterPhotoPath) && (
                  <View style={styles.photoRow}>
                    {f.result?.beforePhotoPath && (
                      <View style={styles.photoBox}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img> */}
                        <Image style={styles.photoImg} src={toAbsolute(f.result.beforePhotoPath)!} />
                        <Text style={styles.photoLabel}>Before</Text>
                      </View>
                    )}
                    {f.result?.afterPhotoPath && (
                      <View style={styles.photoBox}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img> */}
                        <Image style={styles.photoImg} src={toAbsolute(f.result.afterPhotoPath)!} />
                        <Text style={styles.photoLabel}>After</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <ReportDisclaimer template={template} />
        <ReportFooter business={business} template={template} />
      </Page>
    </Document>
  );
}
