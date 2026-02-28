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
import * as Location from "expo-location";
import * as securityApi from "../../../src/api/security";

const SEVERITIES = ["low", "medium", "high", "critical"];

export default function NewIncidentScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    location: "",
    latitude: "",
    longitude: "",
  });

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setForm({
        ...form,
        latitude: loc.coords.latitude.toString(),
        longitude: loc.coords.longitude.toString(),
      });
      Alert.alert("Location captured", `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
    } catch {
      Alert.alert("Error", "Could not get location");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    setSubmitting(true);
    try {
      await securityApi.createIncident(form);
      Alert.alert("Success", "Incident reported");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to report incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(v) => setForm({ ...form, title: v })}
        placeholder="Brief incident title"
      />

      <Text style={styles.label}>Severity</Text>
      <View style={styles.typeRow}>
        {SEVERITIES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.typeChip, form.severity === s && styles.typeChipActive]}
            onPress={() => setForm({ ...form, severity: s })}
          >
            <Text style={[styles.typeChipText, form.severity === s && styles.typeChipTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={form.description}
        onChangeText={(v) => setForm({ ...form, description: v })}
        placeholder="Describe the incident..."
        multiline
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={(v) => setForm({ ...form, location: v })}
        placeholder="e.g., Block A, Ground Floor"
      />

      <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
        <Text style={styles.locationButtonText}>
          {form.latitude ? `GPS: ${form.latitude}, ${form.longitude}` : "Capture GPS Location"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? "Submitting..." : "Report Incident"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6, marginTop: 12 },
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
  typeChipActive: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  typeChipText: { fontSize: 13, color: "#475569", textTransform: "capitalize" },
  typeChipTextActive: { color: "#fff" },
  locationButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  locationButtonText: { fontSize: 13, color: "#475569" },
  submitButton: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
