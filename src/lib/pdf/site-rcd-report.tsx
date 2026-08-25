import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Business, Customer, RcdUnit, Site } from "@/generated/prisma/client";
import { colors, sharedStyles, toAbsolute, ReportLetterhead, ReportFooter, ReportDisclaimer } from "@/lib/pdf/shared";
import { defaultTemplateConfig, type ResolvedTemplateConfig } from "@/lib/report-template-config";

const TYPE_LABELS: Record<string, string> = {
  TYPE_AC: "Type AC",
  TYPE_A: "Type A",
  TYPE_B: "Type B",
};

const styles = StyleSheet.create({
  colPhoto: { width: "12%", padding: 4 },
  colRef: { width: "16%" },
  colLoc: { width: "44%" },
  colType: { width: "28%" },
  thumb: { width: 32, height: 32, objectFit: "cover", borderRadius: 3 },
  thumbPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 3,
    backgroundColor: "#f1f5f9",
  },
  countBadge: {
    fontSize: 8.5,
    color: colors.slate,
    marginBottom: 10,
  },
});

const COLUMN_STYLES: Record<string, object> = {
  location: styles.colLoc,
  type: styles.colType,
};

export function SiteRcdReportDocument({
  business,
  customer,
  site,
  rcdUnits,
  template = defaultTemplateConfig("RCD_TESTING"),
}: {
  business: Business;
  customer: Customer;
  site: Site;
  rcdUnits: RcdUnit[];
  template?: ResolvedTemplateConfig;
}) {
  const columns = template.columns.filter((c) => c in COLUMN_STYLES);

  return (
    <Document title={`${site.name} - RCD Register`} author={business.name}>
      <Page size="A4" style={sharedStyles.page} wrap>
        <ReportLetterhead
          business={business}
          title="RCD / Safety Switch Register"
          subtitle={site.name}
          template={template}
        />

        <View style={sharedStyles.infoRow}>
          <View style={sharedStyles.infoBox}>
            <Text style={sharedStyles.infoLabel}>Customer</Text>
            <Text style={sharedStyles.infoValue}>{customer.name}</Text>
          </View>
          <View style={sharedStyles.infoBox}>
            <Text style={sharedStyles.infoLabel}>Site</Text>
            <Text style={sharedStyles.infoValue}>{site.name}</Text>
            {site.address && <Text style={sharedStyles.infoSub}>{site.address}</Text>}
          </View>
        </View>

        <Text style={styles.countBadge}>
          {rcdUnits.length} RCD{rcdUnits.length === 1 ? "" : "s"} registered
        </Text>

        <View style={sharedStyles.table}>
          <View style={sharedStyles.tHeadRow}>
            <Text style={[sharedStyles.th, styles.colPhoto]}></Text>
            <Text style={[sharedStyles.th, styles.colRef]}>Ref</Text>
            {columns.includes("location") && <Text style={[sharedStyles.th, styles.colLoc]}>Location</Text>}
            {columns.includes("type") && <Text style={[sharedStyles.th, styles.colType]}>Type</Text>}
          </View>
          {rcdUnits.map((u) => (
            <View style={sharedStyles.tRow} key={u.id} wrap={false}>
              <View style={styles.colPhoto}>
                {u.photoPath ? (
                  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img>
                  <Image style={styles.thumb} src={toAbsolute(u.photoPath)!} />
                ) : (
                  <View style={styles.thumbPlaceholder} />
                )}
              </View>
              <Text style={[sharedStyles.td, styles.colRef]}>{u.reference}</Text>
              {columns.includes("location") && <Text style={[sharedStyles.td, styles.colLoc]}>{u.location}</Text>}
              {columns.includes("type") && (
                <Text style={[sharedStyles.td, styles.colType]}>
                  {TYPE_LABELS[u.rcdType]} {u.ratedCurrentMa}mA
                </Text>
              )}
            </View>
          ))}
        </View>

        <ReportDisclaimer template={template} />
        <ReportFooter business={business} template={template} />
      </Page>
    </Document>
  );
}
