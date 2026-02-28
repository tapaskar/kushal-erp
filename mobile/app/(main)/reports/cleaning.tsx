import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as inventoryApi from "../../../src/api/inventory";

export default function CleaningReportScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await inventoryApi.getReportsSummary();
        setData(result?.cleaning);
      } catch {
        // keep existing
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cleaning Report</Text>

      {data && (
        <View style={styles.card}>
          <DetailRow label="Total Zones" value={String(data.totalZones || 0)} />
          <DetailRow label="Scheduled Today" value={String(data.today?.total || 0)} />
          <DetailRow label="Completed Today" value={String(data.today?.completed || 0)} />
          <DetailRow label="In Progress" value={String(data.today?.inProgress || 0)} />
          <DetailRow label="Completion Rate" value={`${data.today?.completionRate || 0}%`} />
          <DetailRow label="Average Rating" value={String(data.avgRating || "N/A")} />
          <DetailRow label="Pending Supply Requests" value={String(data.pendingSupplyRequests || 0)} />
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
