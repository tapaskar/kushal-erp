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
import { useTaskStore } from "../../../src/store/task-store";
import { TASK_STATUS_LABELS } from "../../../src/lib/constants";
import type { StaffTask } from "../../../src/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  accepted: "#3b82f6",
  in_progress: "#8b5cf6",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#94a3b8",
  medium: "#3b82f6",
  high: "#f59e0b",
  urgent: "#ef4444",
};

export default function TaskListScreen() {
  const { tasks, isLoading, fetchTasks } = useTaskStore();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTasks(filter ? { status: filter } : undefined);
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks(filter ? { status: filter } : undefined);
    setRefreshing(false);
  };

  const filters = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

  const renderTask = ({ item }: { item: StaffTask }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => router.push(`/(main)/tasks/${item.id}`)}
    >
      <View style={styles.taskHeader}>
        <View
          style={[
            styles.priorityDot,
            { backgroundColor: PRIORITY_COLORS[item.priority] || "#94a3b8" },
          ]}
        />
        <Text style={styles.taskType}>{item.taskType.replace("_", " ")}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                (STATUS_COLORS[item.status] || "#94a3b8") + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: STATUS_COLORS[item.status] || "#94a3b8" },
            ]}
          >
            {TASK_STATUS_LABELS[item.status] || item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.taskTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.location && (
        <Text style={styles.taskLocation} numberOfLines={1}>
          📍 {item.location}
        </Text>
      )}
      {item.dueBy && (
        <Text style={styles.taskDue}>
          Due: {new Date(item.dueBy).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[
              styles.filterChip,
              filter === f.value && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? "Loading tasks..." : "No tasks found"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: {
    backgroundColor: "#1a56db",
    borderColor: "#1a56db",
  },
  filterText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, gap: 10 },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  taskHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  taskType: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
  taskTitle: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  taskLocation: { fontSize: 13, color: "#64748b", marginTop: 6 },
  taskDue: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
});
