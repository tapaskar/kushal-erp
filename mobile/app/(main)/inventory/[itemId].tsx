import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as inventoryApi from "../../../src/api/inventory";

const REASONS_IN = ["purchase", "donation", "return", "adjustment"];
const REASONS_OUT = ["consumed", "issued", "damaged", "disposed", "adjustment"];

export default function InventoryItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    movementType: "stock_out" as "stock_in" | "stock_out",
    reason: "consumed",
    quantity: "1",
    notes: "",
  });

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const data = await inventoryApi.searchInventory(itemId);
      const found = data.items.find((i: any) => i.id === itemId);
      setItem(found || null);
    } catch {
      Alert.alert("Error", "Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!item) return;
    const qty = parseInt(form.quantity) || 0;
    if (qty <= 0) {
      Alert.alert("Error", "Quantity must be greater than 0");
      return;
    }
    setSubmitting(true);
    try {
      const result = await inventoryApi.recordStock(item.id, {
        ...form,
        quantity: qty,
      });
      setItem({ ...item, quantity: result.newQuantity });
      Alert.alert("Success", "Stock movement recorded");
      setForm({ ...form, quantity: "1", notes: "" });
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Failed to record stock");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>;
  if (!item) return <View style={styles.center}><Text>Item not found</Text></View>;

  const reasons = form.movementType === "stock_in" ? REASONS_IN : REASONS_OUT;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.barcode}>{item.barcode}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{item.quantity}</Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{item.category.replace("_", " ")}</Text>
            <Text style={styles.statLabel}>Category</Text>
          </View>
        </View>
        {item.location && <Text style={styles.location}>Location: {item.location}</Text>}
      </View>

      <Text style={styles.sectionTitle}>Record Stock Movement</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, form.movementType === "stock_out" && styles.typeBtnActive]}
            onPress={() => setForm({ ...form, movementType: "stock_out", reason: "consumed" })}
          >
            <Text style={[styles.typeBtnText, form.movementType === "stock_out" && styles.typeBtnTextActive]}>
              Stock Out
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, form.movementType === "stock_in" && styles.typeBtnActive]}
            onPress={() => setForm({ ...form, movementType: "stock_in", reason: "purchase" })}
          >
            <Text style={[styles.typeBtnText, form.movementType === "stock_in" && styles.typeBtnTextActive]}>
              Stock In
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Reason</Text>
        <View style={styles.reasonRow}>
          {reasons.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, form.reason === r && styles.chipActive]}
              onPress={() => setForm({ ...form, reason: r })}
            >
              <Text style={[styles.chipText, form.reason === r && styles.chipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={form.quantity}
          onChangeText={(v) => setForm({ ...form, quantity: v })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          value={form.notes}
          onChangeText={(v) => setForm({ ...form, notes: v })}
          placeholder="Optional notes"
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? "Recording..." : "Record Movement"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  itemName: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  barcode: { fontSize: 13, color: "#64748b", marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 16 },
  statBox: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 8, padding: 12, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#1a56db", textTransform: "capitalize" },
  statLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  location: { fontSize: 13, color: "#475569", marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6, marginTop: 8 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: "#1a56db" },
  typeBtnText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  typeBtnTextActive: { color: "#fff" },
  reasonRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: "#f1f5f9" },
  chipActive: { backgroundColor: "#1a56db" },
  chipText: { fontSize: 12, color: "#475569", textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  submitButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
