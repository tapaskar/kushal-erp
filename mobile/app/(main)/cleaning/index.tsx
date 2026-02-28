import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useCleaningStore } from "../../../src/store/cleaning-store";

const STATUS_COLORS: Record<string, string> = {
  pending: "#94a3b8",
  in_progress: "#eab308",
  completed: "#16a34a",
  verified: "#2563eb",
  issue_reported: "#dc2626",
};

export default function CleaningScreen() {
  const { schedule, loading, fetchSchedule } = useCleaningStore();
  const router = useRouter();

  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today's Cleaning Schedule</Text>

      <FlatList
        data={schedule}
        keyExtractor={(item, index) => item.log?.id || item.id || String(index)}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        windowSize={10}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchSchedule()} />
        }
        renderItem={({ item }) => {
          const log = item.log || item;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(main)/cleaning/${log.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.zoneName}>{item.zoneName || "Zone"}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: (STATUS_COLORS[log.status] || "#94a3b8") + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[log.status] || "#94a3b8" },
                    ]}
                  >
                    {log.status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              {item.zoneType && (
                <Text style={styles.zoneType}>
                  {item.zoneType.replace("_", " ")}
                  {item.zoneFloor !== null && item.zoneFloor !== undefined
                    ? ` · Floor ${item.zoneFloor}`
                    : ""}
                </Text>
              )}

              {log.startedAt && (
                <Text style={styles.time}>
                  Started: {new Date(log.startedAt).toLocaleTimeString()}
                </Text>
              )}
              {log.completedAt && (
                <Text style={styles.time}>
                  Completed: {new Date(log.completedAt).toLocaleTimeString()}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No cleaning zones scheduled for today</Text>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.suppliesButton}
            onPress={() => router.push("/(main)/cleaning/supplies")}
          >
            <Text style={styles.suppliesButtonText}>View Supply Requests</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  heading: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  zoneName: { fontSize: 16, fontWeight: "600", color: "#1e293b", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  zoneType: { fontSize: 12, color: "#64748b", textTransform: "capitalize", marginBottom: 6 },
  time: { fontSize: 12, color: "#94a3b8" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15 },
  suppliesButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },
  suppliesButtonText: { fontSize: 14, fontWeight: "600", color: "#475569" },
});
