import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Business, Customer, Fitting, Site } from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import { colors, sharedStyles, toAbsolute, TYPE_LABELS } from "@/lib/pdf/shared";

const styles = StyleSheet.create({
  colPhoto: { width: "12%", padding: 4 },
  colRef: { width: "14%" },
  colLoc: { width: "48%" },
  colType: { width: "26%" },
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

export function SiteFittingsReportDocument({
  business,
  customer,
  site,
  fittings,
}: {
  business: Business;
  customer: Customer;
  site: Site;
  fittings: Fitting[];
}) {
  return (
    <Document title={`${site.name} - Fitting Register`} author={business.name}>
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
            <Text style={sharedStyles.reportTitle}>Emergency & Exit Lighting Fitting Register</Text>
            <Text style={sharedStyles.reportSub}>Generated {formatDate(new Date())}</Text>
          </View>
        </View>

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
          {fittings.length} fitting{fittings.length === 1 ? "" : "s"} registered
        </Text>

        <View style={sharedStyles.table}>
          <View style={sharedStyles.tHeadRow}>
            <Text style={[sharedStyles.th, styles.colPhoto]}></Text>
            <Text style={[sharedStyles.th, styles.colRef]}>Ref</Text>
            <Text style={[sharedStyles.th, styles.colLoc]}>Location</Text>
            <Text style={[sharedStyles.th, styles.colType]}>Type</Text>
          </View>
          {fittings.map((f) => (
            <View style={sharedStyles.tRow} key={f.id} wrap={false}>
              <View style={styles.colPhoto}>
                {f.photoPath ? (
                  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img>
                  <Image style={styles.thumb} src={toAbsolute(f.photoPath)!} />
                ) : (
                  <View style={styles.thumbPlaceholder} />
                )}
              </View>
              <Text style={[sharedStyles.td, styles.colRef]}>{f.reference}</Text>
              <Text style={[sharedStyles.td, styles.colLoc]}>{f.location}</Text>
              <Text style={[sharedStyles.td, styles.colType]}>{TYPE_LABELS[f.fittingType]}</Text>
            </View>
          ))}
        </View>

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
