import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import * as inventoryApi from "../../../src/api/inventory";

export default function AttendanceReportScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await inventoryApi.getReportsSummary();
      setData(result?.staff);
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Attendance Report</Text>

      {data && (
        <View style={styles.card}>
          <DetailRow label="Total Active Staff" value={String(data.staff?.totalActive || 0)} />
          <DetailRow label="Today's Shifts" value={String(data.shifts?.todayTotal || 0)} />
          <DetailRow label="Checked In" value={String(data.shifts?.checkedIn || 0)} />
          <DetailRow label="Checked Out" value={String(data.shifts?.checkedOut || 0)} />
          <DetailRow label="Missed" value={String(data.shifts?.missed || 0)} />
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
