import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as inventoryApi from "../../../src/api/inventory";

export default function SecurityReportScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await inventoryApi.getReportsSummary();
        setData(result?.security);
      } catch {
        // keep existing
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Security Report</Text>

      {data && (
        <View style={styles.card}>
          <DetailRow label="Visitors Today" value={String(data.visitors?.todayTotal || 0)} />
          <DetailRow label="Active Visitors" value={String(data.visitors?.activeVisitors || 0)} />
          <DetailRow label="Open Incidents" value={String(data.incidents?.openIncidents || 0)} />
          <DetailRow label="Today's Incidents" value={String(data.incidents?.todayReported || 0)} />
          <DetailRow label="Active SOS Alerts" value={String(data.sos?.activeAlerts || 0)} />
        </View>
      )}

      {!data && !loading && (
        <Text style={styles.empty}>No data available</Text>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  heading: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: { fontSize: 14, color: "#64748b" },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15 },
});
