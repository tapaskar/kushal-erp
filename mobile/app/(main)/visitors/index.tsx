import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useVisitorStore } from "../../../src/store/visitor-store";

const STATUS_COLORS: Record<string, string> = {
  checked_in: "#16a34a",
  checked_out: "#2563eb",
  expected: "#eab308",
  rejected: "#dc2626",
};

export default function VisitorsScreen() {
  const { visitors, loading, fetchVisitors } = useVisitorStore();
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const filtered = visitors.filter(
    (v) =>
      v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
      v.visitorPhone?.includes(search)
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search visitors..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(main)/visitors/new")}
      >
        <Text style={styles.addButtonText}>+ Log New Visitor</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchVisitors()} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(main)/visitors/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.visitorName}>{item.visitorName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: (STATUS_COLORS[item.status] || "#94a3b8") + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[item.status] || "#94a3b8" },
                  ]}
                >
                  {item.status.replace("_", " ")}
                </Text>
              </View>
            </View>
            <Text style={styles.visitorType}>{item.visitorType}</Text>
            {item.visitorPhone && (
              <Text style={styles.meta}>Phone: {item.visitorPhone}</Text>
            )}
            {item.purpose && (
              <Text style={styles.meta}>Purpose: {item.purpose}</Text>
            )}
            {item.checkInAt && (
              <Text style={styles.time}>
                In: {new Date(item.checkInAt).toLocaleTimeString()}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No visitors today</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#1a56db",
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
    marginBottom: 4,
  },
  visitorName: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  visitorType: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "capitalize",
    marginBottom: 6,
  },
  meta: { fontSize: 13, color: "#475569", marginBottom: 2 },
  time: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15 },
});
