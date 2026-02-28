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
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Icon } from "../../../src/components/ui/Icon";
import { colors, typography, spacing, radii } from "../../../src/theme";
import type { StaffTask } from "../../../src/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.info,
  in_progress: colors.purple,
  completed: colors.success,
  cancelled: colors.error,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: colors.textMuted,
  medium: colors.info,
  high: colors.warning,
  urgent: colors.error,
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
    <Card
      onPress={() => router.push(`/(main)/tasks/${item.id}`)}
      style={styles.taskCard}
    >
      <View style={styles.taskHeader}>
        <View
          style={[
            styles.priorityDot,
            { backgroundColor: PRIORITY_COLORS[item.priority] || colors.textMuted },
          ]}
        />
        <Text style={styles.taskType}>{item.taskType.replace("_", " ")}</Text>
        <Badge
          label={TASK_STATUS_LABELS[item.status] || item.status}
          color={STATUS_COLORS[item.status] || colors.textMuted}
          size="sm"
        />
      </View>
      <Text style={styles.taskTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.location && (
        <View style={styles.taskLocationRow}>
          <Icon name="location" size={14} color={colors.textTertiary} />
          <Text style={styles.taskLocation} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      )}
      {item.dueBy && (
        <View style={styles.taskDueRow}>
          <Icon name="calendar" size={12} color={colors.textMuted} />
          <Text style={styles.taskDue}>
            Due: {new Date(item.dueBy).toLocaleDateString()}
          </Text>
        </View>
      )}
    </Card>
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="tasks" size={40} color={colors.border} />
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
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.captionMedium,
    color: colors.textTertiary,
  },
  filterTextActive: { color: colors.textOnPrimary },
  list: { padding: spacing.lg, gap: spacing.sm },
  taskCard: {
    marginBottom: 0,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  taskType: {
    ...typography.overline,
    color: colors.textTertiary,
    flex: 1,
  },
  taskTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  taskLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  taskLocation: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
  taskDueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  taskDue: {
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
