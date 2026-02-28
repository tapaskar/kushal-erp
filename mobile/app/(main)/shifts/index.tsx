import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { useShiftStore } from "../../../src/store/shift-store";
import { SHIFT_STATUS_LABELS } from "../../../src/lib/constants";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Icon } from "../../../src/components/ui/Icon";
import { colors, typography, spacing } from "../../../src/theme";
import type { Shift } from "../../../src/lib/types";

const STATUS_COLORS: Record<string, string> = {
  scheduled: colors.textMuted,
  checked_in: colors.success,
  checked_out: colors.info,
  missed: colors.error,
  cancelled: "#6b7280",
};

export default function ShiftListScreen() {
  const { shifts, isLoading, fetchShifts } = useShiftStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShifts();
    setRefreshing(false);
  };

  const renderShift = ({ item }: { item: Shift }) => {
    const scheduledStart = new Date(item.scheduledStart);
    const scheduledEnd = new Date(item.scheduledEnd);
    const hoursWorked =
      item.actualCheckIn && item.actualCheckOut
        ? (
            (new Date(item.actualCheckOut).getTime() -
              new Date(item.actualCheckIn).getTime()) /
            3600000
          ).toFixed(1)
        : null;

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateRow}>
            <Icon name="calendar" size={14} color={colors.textTertiary} />
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>
          <Badge
            label={SHIFT_STATUS_LABELS[item.status] || item.status}
            color={STATUS_COLORS[item.status] || colors.textMuted}
          />
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Scheduled</Text>
            <Text style={styles.timeValue}>
              {scheduledStart.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {scheduledEnd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {item.actualCheckIn && (
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Actual</Text>
              <Text style={styles.timeValue}>
                {new Date(item.actualCheckIn).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {item.actualCheckOut &&
                  ` - ${new Date(item.actualCheckOut).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`}
              </Text>
            </View>
          )}
        </View>

        {hoursWorked && (
          <View style={styles.hoursRow}>
            <Icon name="clock" size={14} color={colors.success} />
            <Text style={styles.hoursWorked}>{hoursWorked} hours worked</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={renderShift}
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
            <Icon name="clock" size={40} color={colors.border} />
            <Text style={styles.emptyText}>
              {isLoading ? "Loading shifts..." : "No shift history"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.sm },
  card: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  date: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  timeRow: { flexDirection: "row", gap: spacing.xl },
  timeBlock: {},
  timeLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: 2,
  },
  timeValue: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 14,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  hoursWorked: {
    ...typography.captionSemibold,
    color: colors.success,
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
