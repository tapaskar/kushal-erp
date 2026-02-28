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
import * as tasksApi from "../../../src/api/tasks";
import * as inventoryApi from "../../../src/api/inventory";
import type { StaffTask } from "../../../src/lib/types";
import { TASK_STATUS_LABELS } from "../../../src/lib/constants";
import { useAuthStore } from "../../../src/store/auth-store";

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<StaffTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [materialQty, setMaterialQty] = useState("1");
  const [materialNotes, setMaterialNotes] = useState("");
  const [submittingMaterial, setSubmittingMaterial] = useState(false);
  const staff = useAuthStore((s) => s.staff);
  const isTechnical = ["maintenance", "electrician", "plumber"].includes(staff?.role || "");
  const router = useRouter();

  useEffect(() => {
    loadTask();
    if (isTechnical) loadMaterials();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await tasksApi.getTask(taskId);
      setTask(data.task);
    } catch {
      Alert.alert("Error", "Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await inventoryApi.getMaterialsForTask(taskId);
      setMaterials(data.materials || []);
    } catch {
      // ignore
    }
  };

  const handleSearchMaterials = async () => {
    if (!materialSearch.trim()) return;
    try {
      const data = await inventoryApi.searchInventory(materialSearch.trim());
      setSearchResults(data.items || []);
    } catch {
      // ignore
    }
  };

  const handleLogMaterial = async () => {
    if (!selectedItem) {
      Alert.alert("Error", "Select an inventory item first");
      return;
    }
    setSubmittingMaterial(true);
    try {
      await inventoryApi.logMaterialUsage(taskId, {
        inventoryItemId: selectedItem.id,
        quantityUsed: parseInt(materialQty) || 1,
        notes: materialNotes,
      });
      Alert.alert("Success", "Material usage logged");
      setShowMaterialForm(false);
      setSelectedItem(null);
      setMaterialSearch("");
      setMaterialQty("1");
      setMaterialNotes("");
      loadMaterials();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Failed to log material");
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!task) return;
    setUpdating(true);
    try {
      await tasksApi.updateTaskStatus(task.id, { status: newStatus });
      setTask({ ...task, status: newStatus as StaffTask["status"] });
    } catch {
      Alert.alert("Error", "Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  const handleTakePhoto = async (type: "before" | "after") => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0] && task) {
      const uri = result.assets[0].uri;
      // In production, upload to S3 first, then save URL
      try {
        await tasksApi.uploadTaskPhoto(task.id, { type, photoUrl: uri });
        setTask({
          ...task,
          [type === "before" ? "beforePhotoUrl" : "afterPhotoUrl"]: uri,
        });
      } catch {
        Alert.alert("Error", "Failed to upload photo");
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>Task not found</Text>
      </View>
    );
  }

  const nextStatus: Record<string, string | undefined> = {
    pending: "accepted",
    accepted: "in_progress",
    in_progress: "completed",
  };

  const nextAction: Record<string, string> = {
    pending: "Accept Task",
    accepted: "Start Work",
    in_progress: "Mark Complete",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.taskType}>{task.taskType.replace("_", " ")}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {TASK_STATUS_LABELS[task.status]}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{task.title}</Text>

      {task.description && (
        <Text style={styles.description}>{task.description}</Text>
      )}

      <View style={styles.detailsCard}>
        <DetailRow label="Priority" value={task.priority} />
        {task.location && <DetailRow label="Location" value={task.location} />}
        {task.dueBy && (
          <DetailRow
            label="Due By"
            value={new Date(task.dueBy).toLocaleString()}
          />
        )}
        {task.startedAt && (
          <DetailRow
            label="Started"
            value={new Date(task.startedAt).toLocaleString()}
          />
        )}
        {task.completedAt && (
          <DetailRow
            label="Completed"
            value={new Date(task.completedAt).toLocaleString()}
          />
        )}
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoRow}>
          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>Before</Text>
            {task.beforePhotoUrl ? (
              <Image
                source={{ uri: task.beforePhotoUrl }}
                style={styles.photo}
              />
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
            {task.afterPhotoUrl ? (
              <Image
                source={{ uri: task.afterPhotoUrl }}
                style={styles.photo}
              />
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

      {/* Materials Used (technical roles) */}
      {isTechnical && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials Used</Text>
          {materials.map((m: any) => (
            <View key={m.usage.id} style={styles.materialRow}>
              <Text style={styles.materialName}>{m.itemName}</Text>
              <Text style={styles.materialQty}>x{m.usage.quantityUsed}</Text>
            </View>
          ))}
          {materials.length === 0 && (
            <Text style={{ color: "#94a3b8", fontSize: 13 }}>No materials logged yet</Text>
          )}

          {!showMaterialForm ? (
            <TouchableOpacity
              style={styles.addMaterialBtn}
              onPress={() => setShowMaterialForm(true)}
            >
              <Text style={styles.addMaterialBtnText}>+ Log Material Used</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.materialForm}>
              <TextInput
                style={styles.materialInput}
                value={materialSearch}
                onChangeText={setMaterialSearch}
                placeholder="Search inventory item..."
                onSubmitEditing={handleSearchMaterials}
                returnKeyType="search"
              />
              {searchResults.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.searchResult,
                    selectedItem?.id === item.id && styles.searchResultActive,
                  ]}
                  onPress={() => setSelectedItem(item)}
                >
                  <Text style={styles.searchResultText}>
                    {item.name} ({item.barcode}) - Qty: {item.quantity}
                  </Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={styles.materialInput}
                value={materialQty}
                onChangeText={setMaterialQty}
                placeholder="Quantity"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.materialInput}
                value={materialNotes}
                onChangeText={setMaterialNotes}
                placeholder="Notes (optional)"
              />
              <TouchableOpacity
                style={[styles.logMaterialBtn, submittingMaterial && { opacity: 0.6 }]}
                onPress={handleLogMaterial}
                disabled={submittingMaterial}
              >
                <Text style={styles.logMaterialBtnText}>
                  {submittingMaterial ? "Logging..." : "Log Material"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Action Button */}
      {nextStatus[task.status] && (
        <TouchableOpacity
          style={[styles.actionButton, updating && styles.actionButtonDisabled]}
          onPress={() => handleStatusUpdate(nextStatus[task.status]!)}
          disabled={updating}
        >
          <Text style={styles.actionButtonText}>
            {updating ? "Updating..." : nextAction[task.status]}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskType: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  title: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
  description: { fontSize: 14, color: "#64748b", lineHeight: 20, marginBottom: 16 },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: { fontSize: 13, color: "#64748b" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#1e293b", textTransform: "capitalize" },
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
  actionButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  materialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  materialName: { fontSize: 13, fontWeight: "500", color: "#1e293b" },
  materialQty: { fontSize: 13, fontWeight: "600", color: "#1a56db" },
  addMaterialBtn: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addMaterialBtnText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  materialForm: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  materialInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  searchResult: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
    marginBottom: 4,
  },
  searchResultActive: { backgroundColor: "#dbeafe" },
  searchResultText: { fontSize: 12, color: "#475569" },
  logMaterialBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  logMaterialBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
