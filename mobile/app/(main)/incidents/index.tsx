import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as securityApi from "../../../src/api/security";
import type { Incident } from "../../../src/lib/types";

const SEVERITY_COLORS: Record<string, string> = {
  low: "#16a34a",
  medium: "#eab308",
  high: "#f97316",
  critical: "#dc2626",
};

export default function IncidentsScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await securityApi.getIncidents();
      setIncidents(data.incidents);
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(main)/incidents/new")}
      >
        <Text style={styles.addButtonText}>+ Report Incident</Text>
      </TouchableOpacity>

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadIncidents} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: (SEVERITY_COLORS[item.severity] || "#94a3b8") + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    { color: SEVERITY_COLORS[item.severity] || "#94a3b8" },
                  ]}
                >
                  {item.severity}
                </Text>
              </View>
            </View>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.status}>{item.status}</Text>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No incidents reported</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  addButton: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  addButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 15, fontWeight: "600", color: "#1e293b", flex: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  severityText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  description: { fontSize: 13, color: "#64748b", marginBottom: 8 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    fontSize: 12,
    color: "#475569",
    textTransform: "capitalize",
    fontWeight: "500",
  },
  time: { fontSize: 12, color: "#94a3b8" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15 },
});
