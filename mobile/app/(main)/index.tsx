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
import { useAuthStore } from "../../src/store/auth-store";
import { useShiftStore } from "../../src/store/shift-store";
import { useTaskStore } from "../../src/store/task-store";
import { STAFF_ROLES, SHIFT_STATUS_LABELS } from "../../src/lib/constants";

interface QuickAction {
  icon: string;
  label: string;
  route: string;
}

function getQuickActions(role: string): QuickAction[] {
  const viewTasks = { icon: "📋", label: "View Tasks", route: "/(main)/tasks" };
  const startPatrol = { icon: "🛡️", label: "Start Patrol", route: "/(main)/patrol" };
  const shiftHistory = { icon: "⏰", label: "Shift History", route: "/(main)/shifts" };
  const scanQr = { icon: "📷", label: "Scan QR", route: "/(main)/scan-qr" };
  const startCleaning = { icon: "✨", label: "Start Cleaning", route: "/(main)/cleaning" };
  const viewReports = { icon: "📊", label: "View Reports", route: "/(main)/reports" };
  const reportIncident = { icon: "🚨", label: "Report Incident", route: "/(main)/incidents/new" };
  const inventory = { icon: "📦", label: "Inventory", route: "/(main)/inventory" };

  switch (role) {
    case "security":
      return [viewTasks, startPatrol, shiftHistory, reportIncident];
    case "supervisor":
      return [viewTasks, startPatrol, viewReports, scanQr];
    case "housekeeping":
      return [viewTasks, startCleaning, shiftHistory, scanQr];
    case "gardener":
      return [viewTasks, inventory, shiftHistory, scanQr];
    case "maintenance":
    case "electrician":
    case "plumber":
      return [viewTasks, shiftHistory, scanQr, reportIncident];
    default:
      return [viewTasks, shiftHistory, scanQr];
  }
}

export default function DashboardScreen() {
  const { staff, society } = useAuthStore();
  const { currentShift, fetchCurrentShift } = useShiftStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    await Promise.all([fetchCurrentShift(), fetchTasks()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "accepted"
  );
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>
          Hello, {staff?.name?.split(" ")[0] || "Staff"}
        </Text>
        <Text style={styles.role}>
          {STAFF_ROLES[staff?.role || ""] || staff?.role} at{" "}
          {society?.name || "Society"}
        </Text>
      </View>

      {/* Current Shift */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Shift</Text>
        {currentShift ? (
          <TouchableOpacity
            style={styles.shiftCard}
            onPress={() => router.push("/(main)/shifts/clock")}
          >
            <View style={styles.shiftRow}>
              <Text style={styles.shiftTime}>
                {new Date(currentShift.scheduledStart).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(currentShift.scheduledEnd).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  currentShift.status === "checked_in"
                    ? styles.statusActive
                    : styles.statusScheduled,
                ]}
              >
                <Text style={styles.statusText}>
                  {SHIFT_STATUS_LABELS[currentShift.status] ||
                    currentShift.status}
                </Text>
              </View>
            </View>
            {currentShift.status === "scheduled" && (
              <Text style={styles.shiftAction}>Tap to check in</Text>
            )}
            {currentShift.status === "checked_in" && (
              <Text style={styles.shiftAction}>Tap to check out</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No shift scheduled for today</Text>
          </View>
        )}
      </View>

      {/* Task Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: "#fef3c7" }]}
            onPress={() => router.push("/(main)/tasks")}
          >
            <Text style={[styles.statNumber, { color: "#d97706" }]}>
              {pendingTasks.length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: "#dbeafe" }]}
            onPress={() => router.push("/(main)/tasks")}
          >
            <Text style={[styles.statNumber, { color: "#2563eb" }]}>
              {inProgressTasks.length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: "#dcfce7" }]}
            onPress={() => router.push("/(main)/tasks")}
          >
            <Text style={[styles.statNumber, { color: "#16a34a" }]}>
              {tasks.filter((t) => t.status === "completed").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {getQuickActions(staff?.role || "").map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionButton}
              onPress={() => router.push(action.route as any)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  welcomeCard: {
    backgroundColor: "#1a56db",
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  role: {
    fontSize: 14,
    color: "#bfdbfe",
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  shiftCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  shiftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shiftTime: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusScheduled: {
    backgroundColor: "#f1f5f9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  shiftAction: {
    fontSize: 13,
    color: "#1a56db",
    fontWeight: "500",
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    width: "47%" as any,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
});
