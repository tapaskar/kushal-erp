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
import * as patrolsApi from "../../../src/api/patrols";
import { PATROL_STATUS_LABELS } from "../../../src/lib/constants";

interface PatrolLogItem {
  log: {
    id: string;
    status: string;
    totalCheckpoints: number;
    visitedCheckpoints: number;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
  };
  routeName: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#94a3b8",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  missed: "#ef4444",
  partial: "#f97316",
};

export default function PatrolListScreen() {
  const [patrols, setPatrols] = useState<PatrolLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadPatrols = async () => {
    try {
      const data = await patrolsApi.getPatrolLogs();
      setPatrols(data.patrols || []);
    } catch {
      setPatrols([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatrols();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatrols();
    setRefreshing(false);
  };

  const renderPatrol = ({ item }: { item: PatrolLogItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(main)/patrol/${item.log.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.routeName}>{item.routeName}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                (STATUS_COLORS[item.log.status] || "#94a3b8") + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: STATUS_COLORS[item.log.status] || "#94a3b8" },
            ]}
          >
            {PATROL_STATUS_LABELS[item.log.status] || item.log.status}
          </Text>
        </View>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  item.log.totalCheckpoints > 0
                    ? (item.log.visitedCheckpoints / item.log.totalCheckpoints) *
                      100
                    : 0
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.log.visitedCheckpoints}/{item.log.totalCheckpoints}
        </Text>
      </View>
      <Text style={styles.dateText}>
        {new Date(item.log.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={patrols}
        keyExtractor={(item) => item.log.id}
        renderItem={renderPatrol}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? "Loading patrols..." : "No patrol assignments"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  routeName: { fontSize: 16, fontWeight: "600", color: "#1e293b", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#22c55e",
    borderRadius: 3,
  },
  progressText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  dateText: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
});
