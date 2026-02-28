import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as visitorsApi from "../../../src/api/visitors";

const VISITOR_TYPES = ["guest", "delivery", "cab", "vendor", "service", "other"];

export default function NewVisitorScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    visitorName: "",
    visitorPhone: "",
    visitorType: "guest",
    purpose: "",
    vehicleNumber: "",
    checkInGate: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!form.visitorName.trim()) {
      Alert.alert("Error", "Visitor name is required");
      return;
    }
    setSubmitting(true);
    try {
      await visitorsApi.createVisitor(form);
      Alert.alert("Success", "Visitor logged successfully");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to log visitor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Visitor Name *</Text>
      <TextInput
        style={styles.input}
        value={form.visitorName}
        onChangeText={(v) => setForm({ ...form, visitorName: v })}
        placeholder="Enter name"
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={form.visitorPhone}
        onChangeText={(v) => setForm({ ...form, visitorPhone: v })}
        placeholder="Enter phone"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Visitor Type</Text>
      <View style={styles.typeRow}>
        {VISITOR_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeChip,
              form.visitorType === type && styles.typeChipActive,
            ]}
            onPress={() => setForm({ ...form, visitorType: type })}
          >
            <Text
              style={[
                styles.typeChipText,
                form.visitorType === type && styles.typeChipTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Purpose</Text>
      <TextInput
        style={styles.input}
        value={form.purpose}
        onChangeText={(v) => setForm({ ...form, purpose: v })}
        placeholder="Purpose of visit"
      />

      <Text style={styles.label}>Vehicle Number</Text>
      <TextInput
        style={styles.input}
        value={form.vehicleNumber}
        onChangeText={(v) => setForm({ ...form, vehicleNumber: v })}
        placeholder="e.g., DL 01 AB 1234"
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Gate</Text>
      <TextInput
        style={styles.input}
        value={form.checkInGate}
        onChangeText={(v) => setForm({ ...form, checkInGate: v })}
        placeholder="e.g., Main Gate"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={form.notes}
        onChangeText={(v) => setForm({ ...form, notes: v })}
        placeholder="Any additional notes"
        multiline
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? "Logging..." : "Log Visitor Entry"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  typeChipActive: {
    backgroundColor: "#1a56db",
    borderColor: "#1a56db",
  },
  typeChipText: { fontSize: 13, color: "#475569", textTransform: "capitalize" },
  typeChipTextActive: { color: "#fff" },
  submitButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
