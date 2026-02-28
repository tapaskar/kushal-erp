import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as cleaningApi from "../../../src/api/cleaning";

export default function CleanZoneScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [beforePhoto, setBeforePhoto] = useState<string>("");
  const [afterPhoto, setAfterPhoto] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    loadLog();
  }, [logId]);

  const loadLog = async () => {
    try {
      const data = await cleaningApi.getCleaningSchedule();
      const found = data.schedule.find((item: any) => item.log?.id === logId);
      if (found) {
        setLog(found);
        setBeforePhoto(found.log?.beforePhotoUrl || "");
        setAfterPhoto(found.log?.afterPhotoUrl || "");
      }
    } catch {
      Alert.alert("Error", "Failed to load cleaning log");
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async (type: "before" | "after") => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      if (type === "before") setBeforePhoto(result.assets[0].uri);
      else setAfterPhoto(result.assets[0].uri);
    }
  };

  const handleStart = async () => {
    setUpdating(true);
    try {
      await cleaningApi.startCleaning(logId);
      setLog({
        ...log,
        log: { ...log.log, status: "in_progress", startedAt: new Date().toISOString() },
      });
    } catch {
      Alert.alert("Error", "Failed to start cleaning");
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = async () => {
    setUpdating(true);
    try {
      await cleaningApi.completeCleaning(logId, {
        beforePhotoUrl: beforePhoto,
        afterPhotoUrl: afterPhoto,
        notes,
      });
      setLog({
        ...log,
        log: { ...log.log, status: "completed", completedAt: new Date().toISOString() },
      });
      Alert.alert("Success", "Cleaning marked as complete");
    } catch {
      Alert.alert("Error", "Failed to complete cleaning");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (!log) {
    return <View style={styles.center}><Text>Cleaning log not found</Text></View>;
  }

  const status = log.log?.status || "pending";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.zoneName}>{log.zoneName}</Text>
        <Text style={styles.zoneType}>
          {log.zoneType?.replace("_", " ")}
          {log.zoneFloor != null ? ` · Floor ${log.zoneFloor}` : ""}
        </Text>
        {log.zoneDescription && (
          <Text style={styles.description}>{log.zoneDescription}</Text>
        )}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>{status.replace("_", " ")}</Text>
        </View>
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoRow}>
          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>Before</Text>
            {beforePhoto ? (
              <Image source={{ uri: beforePhoto }} style={styles.photo} />
            ) : (
              <TouchableOpacity
                style={styles.photoPlaceholder}
                onPress={() => handleTakePhoto("before")}
              >
                <Text style={styles.photoPlaceholderText}>📷 Take Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>After</Text>
            {afterPhoto ? (
              <Image source={{ uri: afterPhoto }} style={styles.photo} />
            ) : (
              <TouchableOpacity
                style={styles.photoPlaceholder}
                onPress={() => handleTakePhoto("after")}
              >
                <Text style={styles.photoPlaceholderText}>📷 Take Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes about this cleaning..."
        multiline
      />

      {/* Action Buttons */}
      {status === "pending" && (
        <TouchableOpacity
          style={[styles.actionButton, updating && { opacity: 0.6 }]}
          onPress={handleStart}
          disabled={updating}
        >
          <Text style={styles.actionButtonText}>
            {updating ? "Starting..." : "Start Cleaning"}
          </Text>
        </TouchableOpacity>
      )}

      {status === "in_progress" && (
        <TouchableOpacity
          style={[styles.completeButton, updating && { opacity: 0.6 }]}
          onPress={handleComplete}
          disabled={updating}
        >
          <Text style={styles.actionButtonText}>
            {updating ? "Completing..." : "Mark Complete"}
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  zoneName: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  zoneType: { fontSize: 13, color: "#64748b", textTransform: "capitalize", marginBottom: 8 },
  description: { fontSize: 14, color: "#475569", marginBottom: 8 },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusLabel: { fontSize: 13, color: "#64748b", marginRight: 8 },
  statusValue: { fontSize: 13, fontWeight: "600", color: "#1e293b", textTransform: "capitalize" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 10 },
  photoRow: { flexDirection: "row", gap: 12 },
  photoBox: { flex: 1 },
  photoLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  photo: { width: "100%", height: 150, borderRadius: 10 },
  photoPlaceholder: {
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  photoPlaceholderText: { color: "#94a3b8", fontSize: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 80,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  actionButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#16a34a",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
