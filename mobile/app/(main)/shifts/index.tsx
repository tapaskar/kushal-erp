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
import type { Shift } from "../../../src/lib/types";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#94a3b8",
  checked_in: "#22c55e",
  checked_out: "#3b82f6",
  missed: "#ef4444",
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Text>
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
              {SHIFT_STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
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
          <Text style={styles.hoursWorked}>{hoursWorked} hours worked</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={renderShift}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
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
  date: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
  timeRow: { flexDirection: "row", gap: 20 },
  timeBlock: {},
  timeLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 2 },
  timeValue: { fontSize: 14, color: "#475569", fontWeight: "500" },
  hoursWorked: {
    fontSize: 13,
    color: "#22c55e",
    fontWeight: "600",
    marginTop: 8,
  },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
});
