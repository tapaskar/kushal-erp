import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";
import { useShiftStore } from "../../src/store/shift-store";
import { useTaskStore } from "../../src/store/task-store";
import { STAFF_ROLES, SHIFT_STATUS_LABELS } from "../../src/lib/constants";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { Icon, type IconName } from "../../src/components/ui/Icon";
import { colors, typography, spacing, radii, shadows } from "../../src/theme";

interface QuickAction {
  icon: IconName;
  label: string;
  route: string;
}

function getQuickActions(role: string): QuickAction[] {
  const viewTasks: QuickAction = { icon: "tasks", label: "View Tasks", route: "/(main)/tasks" };
  const startPatrol: QuickAction = { icon: "shield", label: "Start Patrol", route: "/(main)/patrol" };
  const shiftHistory: QuickAction = { icon: "clock", label: "Shift History", route: "/(main)/shifts" };
  const scanQr: QuickAction = { icon: "qr-scan", label: "Scan QR", route: "/(main)/scan-qr" };
  const startCleaning: QuickAction = { icon: "cleaning", label: "Start Cleaning", route: "/(main)/cleaning" };
  const viewReports: QuickAction = { icon: "reports", label: "View Reports", route: "/(main)/reports" };
  const reportIncident: QuickAction = { icon: "incident", label: "Report Incident", route: "/(main)/incidents/new" };
  const inventory: QuickAction = { icon: "inventory", label: "Inventory", route: "/(main)/inventory" };

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
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const statCards = [
    { count: pendingTasks.length, label: "Pending", color: colors.warningDark, bg: colors.warningBg, icon: "clock" as IconName },
    { count: inProgressTasks.length, label: "In Progress", color: colors.infoDark, bg: colors.infoBg, icon: "refresh" as IconName },
    { count: completedTasks.length, label: "Completed", color: colors.successDark, bg: colors.successBg, icon: "check-circle" as IconName },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* ── Welcome Card ── */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              Hello, {staff?.name?.split(" ")[0] || "Staff"}
            </Text>
            <Text style={styles.role}>
              {STAFF_ROLES[staff?.role || ""] || staff?.role} at{" "}
              {society?.name || "Society"}
            </Text>
          </View>
          <View style={styles.welcomeIconCircle}>
            <Icon name="person" size={28} color={colors.primary} filled />
          </View>
        </View>
      </LinearGradient>

      {/* ── Current Shift ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Shift</Text>
        {currentShift ? (
          <Card
            variant="elevated"
            onPress={() => router.push("/(main)/shifts/clock")}
          >
            <View style={styles.shiftRow}>
              <View style={styles.shiftTimeContainer}>
                <Icon name="clock" size={18} color={colors.primary} />
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
              </View>
              <Badge
                label={
                  SHIFT_STATUS_LABELS[currentShift.status] ||
                  currentShift.status
                }
                color={
                  currentShift.status === "checked_in"
                    ? colors.success
                    : colors.textMuted
                }
              />
            </View>
            {(currentShift.status === "scheduled" ||
              currentShift.status === "checked_in") && (
              <Text style={styles.shiftAction}>
                {currentShift.status === "scheduled"
                  ? "Tap to check in"
                  : "Tap to check out"}
              </Text>
            )}
          </Card>
        ) : (
          <Card variant="outlined">
            <View style={{ alignItems: "center", paddingVertical: spacing.sm }}>
              <Text style={styles.emptyText}>
                No shift scheduled for today
              </Text>
            </View>
          </Card>
        )}
      </View>

      {/* ── Task Summary ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <View style={styles.statsRow}>
          {statCards.map((s) => (
            <Card
              key={s.label}
              variant="outlined"
              padding="md"
              onPress={() => router.push("/(main)/tasks")}
              style={[styles.statCard, { backgroundColor: s.bg }]}
            >
              <View style={styles.statIconRow}>
                <Icon name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[styles.statNumber, { color: s.color }]}>
                {s.count}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {getQuickActions(staff?.role || "").map((action) => (
            <Card
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={styles.actionButton}
            >
              <View style={styles.actionIconCircle}>
                <Icon name={action.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeCard: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    ...typography.h2,
    color: colors.textOnPrimary,
  },
  role: {
    ...typography.caption,
    color: colors.textOnPrimaryMuted,
    marginTop: spacing.xs,
  },
  welcomeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  shiftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shiftTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  shiftTime: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  shiftAction: {
    ...typography.captionMedium,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    borderWidth: 0,
  },
  statIconRow: {
    marginBottom: spacing.xs,
  },
  statNumber: {
    ...typography.statNumber,
  },
  statLabel: {
    ...typography.statLabel,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    width: "47%" as any,
    alignItems: "center",
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primaryBgLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
});
