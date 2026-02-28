import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as visitorsApi from "../../../src/api/visitors";
import type { VisitorLog } from "../../../src/lib/types";

export default function VisitorDetailScreen() {
  const { visitorId } = useLocalSearchParams<{ visitorId: string }>();
  const [visitor, setVisitor] = useState<VisitorLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadVisitor();
  }, [visitorId]);

  const loadVisitor = async () => {
    try {
      const data = await visitorsApi.getVisitors();
      const found = data.visitors.find(
        (v: any) => (v.visitor?.id || v.id) === visitorId
      );
      setVisitor(found?.visitor || found || null);
    } catch {
      Alert.alert("Error", "Failed to load visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!visitor) return;
    setChecking(true);
    try {
      await visitorsApi.checkoutVisitor(visitor.id);
      setVisitor({ ...visitor, status: "checked_out", checkOutAt: new Date().toISOString() });
      Alert.alert("Success", "Visitor checked out");
    } catch {
      Alert.alert("Error", "Failed to check out visitor");
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!visitor) {
    return (
      <View style={styles.center}>
        <Text>Visitor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{visitor.visitorName}</Text>
        <Text style={styles.type}>{visitor.visitorType}</Text>

        <DetailRow label="Status" value={visitor.status.replace("_", " ")} />
        {visitor.visitorPhone && (
          <DetailRow label="Phone" value={visitor.visitorPhone} />
        )}
        {visitor.purpose && <DetailRow label="Purpose" value={visitor.purpose} />}
        {visitor.vehicleNumber && (
          <DetailRow label="Vehicle" value={visitor.vehicleNumber} />
        )}
        {visitor.checkInGate && (
          <DetailRow label="Check-in Gate" value={visitor.checkInGate} />
        )}
        {visitor.checkInAt && (
          <DetailRow
            label="Check-in Time"
            value={new Date(visitor.checkInAt).toLocaleString()}
          />
        )}
        {visitor.checkOutAt && (
          <DetailRow
            label="Check-out Time"
            value={new Date(visitor.checkOutAt).toLocaleString()}
          />
        )}
        {visitor.notes && <DetailRow label="Notes" value={visitor.notes} />}
      </View>

      {visitor.status === "checked_in" && (
        <TouchableOpacity
          style={[styles.checkoutButton, checking && { opacity: 0.6 }]}
          onPress={handleCheckout}
          disabled={checking}
        >
          <Text style={styles.checkoutText}>
            {checking ? "Processing..." : "Check Out Visitor"}
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  type: {
    fontSize: 13,
    color: "#64748b",
    textTransform: "capitalize",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: { fontSize: 13, color: "#64748b" },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    textTransform: "capitalize",
    maxWidth: "60%",
    textAlign: "right",
  },
  checkoutButton: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
