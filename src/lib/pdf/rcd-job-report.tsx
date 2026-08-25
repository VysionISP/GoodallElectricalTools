import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type {
  Business,
  Customer,
  Job,
  RcdTestResult,
  RcdUnit,
  Site,
  User,
} from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import { colors, sharedStyles, toAbsolute, ReportLetterhead, ReportFooter, ReportDisclaimer } from "@/lib/pdf/shared";
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

  colRef: { width: "12%" },
  colLoc: { width: "24%" },
  colType: { width: "16%" },
  colTrip1x: { width: "12%" },
  colTrip5x: { width: "12%" },
  colButton: { width: "10%" },
  colResult: { width: "14%" },

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

const TYPE_LABELS: Record<string, string> = {
  TYPE_AC: "Type AC",
  TYPE_A: "Type A",
  TYPE_B: "Type B",
};

const FREQUENCY_LABELS: Record<string, string> = {
  SIX_MONTHLY: "6-Monthly RCD Test",
  TWELVE_MONTHLY: "Annual RCD Test",
};

const COLUMN_STYLES: Record<string, object> = {
  location: styles.colLoc,
  type: styles.colType,
  tripRated: styles.colTrip1x,
  trip5x: styles.colTrip5x,
  button: styles.colButton,
};

type RcdUnitWithResult = RcdUnit & { result?: RcdTestResult };

export function RcdJobReportDocument({
  business,
  customer,
  site,
  job,
  technician,
  rcdUnits,
  template = defaultTemplateConfig("RCD_TESTING"),
}: {
  business: Business;
  customer: Customer;
  site: Site;
  job: Job;
  technician: User | null;
  rcdUnits: RcdUnitWithResult[];
  template?: ResolvedTemplateConfig;
}) {
  const tested = rcdUnits.filter((u) => u.result);
  const passCount = tested.filter((u) => u.result!.overallResult === "PASS").length;
  const failCount = tested.filter((u) => u.result!.overallResult === "FAIL").length;
  const repairCount = tested.filter((u) => u.result!.overallResult === "NEEDS_REPAIR").length;
  const needsAttention = rcdUnits.filter((u) => u.result && u.result.overallResult !== "PASS");
  const columns = template.columns.filter((c) => c in COLUMN_STYLES);

  return (
    <Document title={`${site.name} - RCD Test Report`} author={business.name}>
      <Page size="A4" style={sharedStyles.page} wrap>
        <ReportLetterhead
          business={business}
          title="RCD / Safety Switch Test Report"
          subtitle={FREQUENCY_LABELS[job.rcdTestFrequency ?? "TWELVE_MONTHLY"]}
          template={template}
        />

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

        {template.showStatCards && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#f1f5f9" }]}>
              <Text style={[styles.summaryValue, { color: colors.ink }]}>{rcdUnits.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.slate }]}>RCDs tested</Text>
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

        <Text style={sharedStyles.sectionTitle}>RCD Test Results</Text>
        <View style={sharedStyles.table}>
          <View style={sharedStyles.tHeadRow}>
            <Text style={[sharedStyles.th, styles.colRef]}>Ref</Text>
            {columns.includes("location") && <Text style={[sharedStyles.th, styles.colLoc]}>Location</Text>}
            {columns.includes("type") && <Text style={[sharedStyles.th, styles.colType]}>Type</Text>}
            {columns.includes("tripRated") && <Text style={[sharedStyles.th, styles.colTrip1x]}>Trip @ 1x</Text>}
            {columns.includes("trip5x") && <Text style={[sharedStyles.th, styles.colTrip5x]}>Trip @ 5x</Text>}
            {columns.includes("button") && <Text style={[sharedStyles.th, styles.colButton]}>Button</Text>}
            <Text style={[sharedStyles.th, styles.colResult]}>Result</Text>
          </View>
          {rcdUnits.map((u) => (
            <View style={sharedStyles.tRow} key={u.id} wrap={false}>
              <Text style={[sharedStyles.td, styles.colRef]}>{u.reference}</Text>
              {columns.includes("location") && <Text style={[sharedStyles.td, styles.colLoc]}>{u.location}</Text>}
              {columns.includes("type") && (
                <Text style={[sharedStyles.td, styles.colType]}>
                  {TYPE_LABELS[u.rcdType]} {u.ratedCurrentMa}mA
                </Text>
              )}
              {columns.includes("tripRated") && (
                <Text style={[sharedStyles.td, styles.colTrip1x]}>
                  {u.result?.tripTimeRatedMs != null ? `${u.result.tripTimeRatedMs}ms` : "—"}
                </Text>
              )}
              {columns.includes("trip5x") && (
                <Text style={[sharedStyles.td, styles.colTrip5x]}>
                  {u.result?.tripTime5xMs != null ? `${u.result.tripTime5xMs}ms` : "—"}
                </Text>
              )}
              {columns.includes("button") && (
                <Text style={[sharedStyles.td, styles.colButton]}>
                  {u.result?.testButtonPass === true ? "Pass" : u.result?.testButtonPass === false ? "Fail" : "—"}
                </Text>
              )}
              <View style={[styles.colResult, { padding: 5 }]}>
                {u.result ? (
                  <Text style={[sharedStyles.pill, resultPillStyle(u.result.overallResult)]}>
                    {resultLabel(u.result.overallResult)}
                  </Text>
                ) : (
                  <Text style={[sharedStyles.pill, { backgroundColor: "#f1f5f9", color: colors.faint }]}>
                    Not tested
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {needsAttention.length > 0 && (
          <View break>
            <Text style={sharedStyles.sectionTitle}>Repairs Required</Text>
            {needsAttention.map((u) => (
              <View style={styles.repairCard} key={u.id} wrap={false}>
                <View style={styles.repairHeaderRow}>
                  <Text style={styles.repairTitle}>
                    {u.reference} — {u.location}
                  </Text>
                  <Text style={[sharedStyles.pill, resultPillStyle(u.result!.overallResult)]}>
                    {resultLabel(u.result!.overallResult)}
                  </Text>
                </View>
                {u.result?.repairNotes && <Text style={styles.repairNotes}>{u.result.repairNotes}</Text>}
                {template.showPhotos && (u.result?.beforePhotoPath || u.result?.afterPhotoPath) && (
                  <View style={styles.photoRow}>
                    {u.result?.beforePhotoPath && (
                      <View style={styles.photoBox}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img> */}
                        <Image style={styles.photoImg} src={toAbsolute(u.result.beforePhotoPath)!} />
                        <Text style={styles.photoLabel}>Before</Text>
                      </View>
                    )}
                    {u.result?.afterPhotoPath && (
                      <View style={styles.photoBox}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img> */}
                        <Image style={styles.photoImg} src={toAbsolute(u.result.afterPhotoPath)!} />
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
