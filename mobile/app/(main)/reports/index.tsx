import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as inventoryApi from "../../../src/api/inventory";

export default function ReportsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadReports = async () => {
    setLoading(true);
    try {
      const result = await inventoryApi.getReportsSummary();
      setData(result);
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReports} />}
    >
      <Text style={styles.heading}>Reports Dashboard</Text>

      {/* Staff Stats */}
      {data?.staff && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Active"
              value={data.staff.staff?.totalActive || 0}
              color="#1a56db"
            />
            <StatCard
              label="Checked In"
              value={data.staff.shifts?.checkedIn || 0}
              color="#16a34a"
            />
            <StatCard
              label="Tasks Pending"
              value={data.staff.tasks?.pending || 0}
              color="#eab308"
            />
            <StatCard
              label="Completed Today"
              value={data.staff.tasks?.completedToday || 0}
              color="#16a34a"
            />
          </View>
        </View>
      )}

      {/* Security Stats */}
      {data?.security && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Visitors Today"
              value={data.security.visitors?.todayTotal || 0}
              color="#2563eb"
            />
            <StatCard
              label="Active Visitors"
              value={data.security.visitors?.activeVisitors || 0}
              color="#f97316"
            />
            <StatCard
              label="Open Incidents"
              value={data.security.incidents?.openIncidents || 0}
              color="#dc2626"
            />
            <StatCard
              label="SOS Alerts"
              value={data.security.sos?.activeAlerts || 0}
              color="#dc2626"
            />
          </View>
        </View>
      )}

      {/* Cleaning Stats */}
      {data?.cleaning && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Housekeeping</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Zones"
              value={data.cleaning.totalZones || 0}
              color="#1a56db"
            />
            <StatCard
              label="Completed Today"
              value={data.cleaning.today?.completed || 0}
              color="#16a34a"
            />
            <StatCard
              label="Completion Rate"
              value={`${data.cleaning.today?.completionRate || 0}%`}
              color="#16a34a"
            />
            <StatCard
              label="Avg Rating"
              value={data.cleaning.avgRating || "N/A"}
              color="#eab308"
            />
          </View>
        </View>
      )}

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Reports</Text>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push("/(main)/reports/attendance")}
        >
          <Text style={styles.linkText}>Attendance Report</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push("/(main)/reports/cleaning")}
        >
          <Text style={styles.linkText}>Cleaning Report</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push("/(main)/reports/security")}
        >
          <Text style={styles.linkText}>Security Report</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  heading: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "center" },
  linkCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  linkText: { fontSize: 15, fontWeight: "500", color: "#1e293b" },
  linkArrow: { fontSize: 18, color: "#94a3b8" },
});
