import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type {
  Business,
  Customer,
  Fitting,
  FittingTestResult,
  Job,
  Site,
  User,
} from "@/generated/prisma/client";
import { formatDate, formatDateTime } from "@/lib/format";
import { colors, sharedStyles, toAbsolute, TYPE_LABELS } from "@/lib/pdf/shared";

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

  colRef: { width: "12%" },
  colLoc: { width: "34%" },
  colType: { width: "18%" },
  colResult: { width: "16%" },
  colComment: { width: "20%" },

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

type FittingWithResult = Fitting & { result?: FittingTestResult };

export function JobReportDocument({
  business,
  customer,
  site,
  job,
  technician,
  fittings,
}: {
  business: Business;
  customer: Customer;
  site: Site;
  job: Job;
  technician: User | null;
  fittings: FittingWithResult[];
}) {
  const tested = fittings.filter((f) => f.result);
  const passCount = tested.filter((f) => f.result!.overallResult === "PASS").length;
  const failCount = tested.filter((f) => f.result!.overallResult === "FAIL").length;
  const repairCount = tested.filter((f) => f.result!.overallResult === "NEEDS_REPAIR").length;
  const needsAttention = fittings.filter(
    (f) => f.result && f.result.overallResult !== "PASS"
  );

  return (
    <Document
      title={`${site.name} - Emergency Lighting Test Report`}
      author={business.name}
    >
      <Page size="A4" style={sharedStyles.page} wrap>
        <View style={sharedStyles.header} fixed>
          <View style={sharedStyles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img> */}
            {business.logoPath && <Image style={sharedStyles.logo} src={toAbsolute(business.logoPath)!} />}
            <View>
              <Text style={sharedStyles.businessName}>{business.name}</Text>
              {business.address && <Text style={sharedStyles.businessLine}>{business.address}</Text>}
              <Text style={sharedStyles.businessLine}>
                {[business.phone, business.email].filter(Boolean).join("   ·   ")}
              </Text>
              {business.recNumber && (
                <Text style={sharedStyles.businessLine}>REC No: {business.recNumber}</Text>
              )}
            </View>
          </View>
          <View style={sharedStyles.headerRight}>
            <Text style={sharedStyles.reportTitle}>Emergency & Exit Lighting Test Report</Text>
            <Text style={sharedStyles.reportSub}>{TEST_TYPE_LABELS[job.testType] ?? job.testType}</Text>
            <Text style={sharedStyles.reportSub}>Report generated {formatDateTime(new Date())}</Text>
          </View>
        </View>

        <View style={sharedStyles.infoRow}>
          <View style={sharedStyles.infoBox}>
            <Text style={sharedStyles.infoLabel}>Customer</Text>
            <Text style={sharedStyles.infoValue}>{customer.name}</Text>
            {customer.contactName && <Text style={sharedStyles.infoSub}>{customer.contactName}</Text>}
          </View>
          <View style={sharedStyles.infoBox}>
            <Text style={sharedStyles.infoLabel}>Site</Text>
            <Text style={sharedStyles.infoValue}>{site.name}</Text>
            {site.address && <Text style={sharedStyles.infoSub}>{site.address}</Text>}
          </View>
          <View style={sharedStyles.infoBox}>
            <Text style={sharedStyles.infoLabel}>Test details</Text>
            <Text style={sharedStyles.infoValue}>
              {job.completedDate ? formatDate(job.completedDate) : formatDate(job.createdAt)}
            </Text>
            <Text style={sharedStyles.infoSub}>Technician: {technician?.name ?? "—"}</Text>
          </View>
        </View>

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

        <Text style={sharedStyles.sectionTitle}>Fitting Test Results</Text>
        <View style={sharedStyles.table}>
          <View style={sharedStyles.tHeadRow}>
            <Text style={[sharedStyles.th, styles.colRef]}>Ref</Text>
            <Text style={[sharedStyles.th, styles.colLoc]}>Location</Text>
            <Text style={[sharedStyles.th, styles.colType]}>Type</Text>
            <Text style={[sharedStyles.th, styles.colResult]}>Result</Text>
            <Text style={[sharedStyles.th, styles.colComment]}>Comments</Text>
          </View>
          {fittings.map((f) => (
            <View style={sharedStyles.tRow} key={f.id} wrap={false}>
              <Text style={[sharedStyles.td, styles.colRef]}>{f.reference}</Text>
              <Text style={[sharedStyles.td, styles.colLoc]}>{f.location}</Text>
              <Text style={[sharedStyles.td, styles.colType]}>{TYPE_LABELS[f.fittingType]}</Text>
              <View style={[styles.colResult, { padding: 5 }]}>
                {f.result ? (
                  <Text style={[sharedStyles.pill, resultPillStyle(f.result.overallResult)]}>
                    {resultLabel(f.result.overallResult)}
                  </Text>
                ) : (
                  <Text style={[sharedStyles.pill, { backgroundColor: "#f1f5f9", color: colors.faint }]}>
                    Not tested
                  </Text>
                )}
              </View>
              <Text style={[sharedStyles.td, styles.colComment]}>{f.result?.comments ?? ""}</Text>
            </View>
          ))}
        </View>

        {needsAttention.length > 0 && (
          <View break>
            <Text style={sharedStyles.sectionTitle}>Repairs Required</Text>
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
                {f.result?.repairNotes && (
                  <Text style={styles.repairNotes}>{f.result.repairNotes}</Text>
                )}
                {(f.result?.beforePhotoPath || f.result?.afterPhotoPath) && (
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

        <View style={sharedStyles.footer} fixed>
          <Text>
            {business.name}
            {business.recNumber ? ` · REC ${business.recNumber}` : ""}
            {business.abn ? ` · ABN ${business.abn}` : ""}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
