import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import * as cleaningApi from "../../../src/api/cleaning";

const URGENCY_COLORS: Record<string, string> = {
  low: "#16a34a",
  normal: "#2563eb",
  urgent: "#dc2626",
};

export default function SuppliesScreen() {
  const [supplies, setSupplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    quantity: "1",
    urgency: "normal",
    reason: "",
  });

  const loadSupplies = async () => {
    setLoading(true);
    try {
      const data = await cleaningApi.getSupplyRequests();
      setSupplies(data.requests.map((r: any) => r.request || r));
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplies();
  }, []);

  const handleSubmit = async () => {
    if (!form.itemName.trim()) {
      Alert.alert("Error", "Item name is required");
      return;
    }
    setSubmitting(true);
    try {
      await cleaningApi.createSupplyRequest({
        ...form,
        quantity: parseInt(form.quantity) || 1,
      });
      Alert.alert("Success", "Supply request submitted");
      setShowForm(false);
      setForm({ itemName: "", quantity: "1", urgency: "normal", reason: "" });
      loadSupplies();
    } catch {
      Alert.alert("Error", "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.addButtonText}>
          {showForm ? "Cancel" : "+ Request Supplies"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            value={form.itemName}
            onChangeText={(v) => setForm({ ...form, itemName: v })}
            placeholder="e.g., Floor cleaner, Mop"
          />
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={form.quantity}
            onChangeText={(v) => setForm({ ...form, quantity: v })}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Urgency</Text>
          <View style={styles.urgencyRow}>
            {["low", "normal", "urgent"].map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.chip, form.urgency === u && styles.chipActive]}
                onPress={() => setForm({ ...form, urgency: u })}
              >
                <Text style={[styles.chipText, form.urgency === u && styles.chipTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Reason</Text>
          <TextInput
            style={styles.input}
            value={form.reason}
            onChangeText={(v) => setForm({ ...form, reason: v })}
            placeholder="Why is this needed?"
          />
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={supplies}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadSupplies} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={[styles.status, { color: item.status === "approved" ? "#16a34a" : item.status === "rejected" ? "#dc2626" : "#64748b" }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.meta}>
              Qty: {item.quantity} · Urgency:{" "}
              <Text style={{ color: URGENCY_COLORS[item.urgency] || "#475569" }}>
                {item.urgency}
              </Text>
            </Text>
            {item.reason && <Text style={styles.reason}>{item.reason}</Text>}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No supply requests</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  addButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  addButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  formCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  urgencyRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  chipActive: { backgroundColor: "#1a56db" },
  chipText: { fontSize: 13, color: "#475569", textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
  submitButton: {
    backgroundColor: "#16a34a",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  status: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  meta: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  reason: { fontSize: 13, color: "#475569" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15 },
});
