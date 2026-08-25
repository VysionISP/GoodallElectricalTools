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
import { UPLOAD_ROOT } from "@/lib/upload";
import path from "path";

const colors = {
  ink: "#0f172a",
  slate: "#475569",
  faint: "#94a3b8",
  border: "#e2e8f0",
  brand: "#1d4ed8",
  green: "#166534",
  greenBg: "#dcfce7",
  red: "#b91c1c",
  redBg: "#fee2e2",
  amber: "#92400e",
  amberBg: "#fef3c7",
};

const styles = StyleSheet.create({
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
    borderBottomColor: colors.brand,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 42, height: 42, objectFit: "contain" },
  businessName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: colors.ink },
  businessLine: { fontSize: 8, color: colors.slate, marginTop: 1 },
  headerRight: { alignItems: "flex-end" },
  reportTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: colors.brand },
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

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  summaryValue: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  summaryLabel: { fontSize: 7.5, marginTop: 2, textTransform: "uppercase" },

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
  colRef: { width: "12%" },
  colLoc: { width: "34%" },
  colType: { width: "18%" },
  colResult: { width: "16%" },
  colComment: { width: "20%" },

  pill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },

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

const TYPE_LABELS: Record<string, string> = {
  EXIT_SIGN: "Exit sign",
  EMERGENCY_LIGHT: "Emergency light",
  COMBINED: "Combined",
};

const TEST_TYPE_LABELS: Record<string, string> = {
  SIX_MONTHLY_DISCHARGE: "6-Monthly Discharge Test",
  ANNUAL_FULL_TEST: "Annual Full Test",
};

const UPLOADS_URL_PREFIX = "/api/uploads/";

function toAbsolute(uploadUrl: string | null | undefined) {
  if (!uploadUrl?.startsWith(UPLOADS_URL_PREFIX)) return undefined;
  return path.join(UPLOAD_ROOT, uploadUrl.slice(UPLOADS_URL_PREFIX.length));
}

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
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img> */}
            {business.logoPath && <Image style={styles.logo} src={toAbsolute(business.logoPath)!} />}
            <View>
              <Text style={styles.businessName}>{business.name}</Text>
              {business.address && <Text style={styles.businessLine}>{business.address}</Text>}
              <Text style={styles.businessLine}>
                {[business.phone, business.email].filter(Boolean).join("   ·   ")}
              </Text>
              {business.recNumber && (
                <Text style={styles.businessLine}>REC No: {business.recNumber}</Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Emergency & Exit Lighting Test Report</Text>
            <Text style={styles.reportSub}>{TEST_TYPE_LABELS[job.testType] ?? job.testType}</Text>
            <Text style={styles.reportSub}>Report generated {formatDateTime(new Date())}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{customer.name}</Text>
            {customer.contactName && <Text style={styles.infoSub}>{customer.contactName}</Text>}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Site</Text>
            <Text style={styles.infoValue}>{site.name}</Text>
            {site.address && <Text style={styles.infoSub}>{site.address}</Text>}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Test details</Text>
            <Text style={styles.infoValue}>
              {job.completedDate ? formatDate(job.completedDate) : formatDate(job.createdAt)}
            </Text>
            <Text style={styles.infoSub}>Technician: {technician?.name ?? "—"}</Text>
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

        <Text style={styles.sectionTitle}>Fitting Test Results</Text>
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={[styles.th, styles.colRef]}>Ref</Text>
            <Text style={[styles.th, styles.colLoc]}>Location</Text>
            <Text style={[styles.th, styles.colType]}>Type</Text>
            <Text style={[styles.th, styles.colResult]}>Result</Text>
            <Text style={[styles.th, styles.colComment]}>Comments</Text>
          </View>
          {fittings.map((f) => (
            <View style={styles.tRow} key={f.id} wrap={false}>
              <Text style={[styles.td, styles.colRef]}>{f.reference}</Text>
              <Text style={[styles.td, styles.colLoc]}>{f.location}</Text>
              <Text style={[styles.td, styles.colType]}>{TYPE_LABELS[f.fittingType]}</Text>
              <View style={[styles.colResult, { padding: 5 }]}>
                {f.result ? (
                  <Text style={[styles.pill, resultPillStyle(f.result.overallResult)]}>
                    {resultLabel(f.result.overallResult)}
                  </Text>
                ) : (
                  <Text style={[styles.pill, { backgroundColor: "#f1f5f9", color: colors.faint }]}>
                    Not tested
                  </Text>
                )}
              </View>
              <Text style={[styles.td, styles.colComment]}>{f.result?.comments ?? ""}</Text>
            </View>
          ))}
        </View>

        {needsAttention.length > 0 && (
          <View break>
            <Text style={styles.sectionTitle}>Repairs Required</Text>
            {needsAttention.map((f) => (
              <View style={styles.repairCard} key={f.id} wrap={false}>
                <View style={styles.repairHeaderRow}>
                  <Text style={styles.repairTitle}>
                    {f.reference} — {f.location}
                  </Text>
                  <Text style={[styles.pill, resultPillStyle(f.result!.overallResult)]}>
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

        <View style={styles.footer} fixed>
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
