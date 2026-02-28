import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useShiftStore } from "../../../src/store/shift-store";
import { SHIFT_STATUS_LABELS } from "../../../src/lib/constants";

export default function ClockScreen() {
  const { currentShift, fetchCurrentShift, performCheckIn, performCheckOut } =
    useShiftStore();
  const [loading, setLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Location permission is required");
      return null;
    }
    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  };

  const handleCheckIn = async () => {
    if (!currentShift) return;
    setLoading(true);
    try {
      const loc = await getLocation();
      if (!loc) {
        setLoading(false);
        return;
      }

      await performCheckIn({
        shiftId: currentShift.id,
        lat: loc.coords.latitude.toString(),
        lng: loc.coords.longitude.toString(),
        photoUrl: photoUri || undefined,
      });
      Alert.alert("Checked In", "Your shift has started.");
      setPhotoUri(null);
    } catch {
      Alert.alert("Error", "Failed to check in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentShift) return;
    setLoading(true);
    try {
      const loc = await getLocation();
      if (!loc) {
        setLoading(false);
        return;
      }

      await performCheckOut({
        shiftId: currentShift.id,
        lat: loc.coords.latitude.toString(),
        lng: loc.coords.longitude.toString(),
        photoUrl: photoUri || undefined,
      });
      Alert.alert("Checked Out", "Your shift has ended.");
      setPhotoUri(null);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to check out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentShift) {
    return (
      <View style={styles.center}>
        <Text style={styles.noShift}>No active shift found for today</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isScheduled = currentShift.status === "scheduled";
  const isCheckedIn = currentShift.status === "checked_in";

  return (
    <View style={styles.container}>
      {/* Shift Info */}
      <View style={styles.shiftInfo}>
        <Text style={styles.shiftLabel}>
          {SHIFT_STATUS_LABELS[currentShift.status]}
        </Text>
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
        {currentShift.actualCheckIn && (
          <Text style={styles.actualTime}>
            Checked in at{" "}
            {new Date(currentShift.actualCheckIn).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}
      </View>

      {/* Photo */}
      <View style={styles.photoSection}>
        {photoUri ? (
          <View>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={takePhoto}
            >
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraText}>Take Selfie (Optional)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action */}
      {isScheduled && (
        <TouchableOpacity
          style={[styles.actionButton, styles.checkInButton, loading && styles.buttonDisabled]}
          onPress={handleCheckIn}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? "Checking in..." : "Check In"}
          </Text>
        </TouchableOpacity>
      )}

      {isCheckedIn && (
        <TouchableOpacity
          style={[styles.actionButton, styles.checkOutButton, loading && styles.buttonDisabled]}
          onPress={handleCheckOut}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? "Checking out..." : "Check Out"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 24 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  noShift: { fontSize: 16, color: "#64748b", marginBottom: 16 },
  backButton: { padding: 12 },
  backButtonText: { color: "#1a56db", fontWeight: "600" },
  shiftInfo: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  shiftLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  shiftTime: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  actualTime: {
    fontSize: 14,
    color: "#22c55e",
    marginTop: 4,
    fontWeight: "500",
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  cameraButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cameraIcon: { fontSize: 40, marginBottom: 8 },
  cameraText: { color: "#94a3b8", fontSize: 13 },
  preview: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  retakeButton: { marginTop: 10, alignItems: "center" },
  retakeButtonText: { color: "#1a56db", fontSize: 14, fontWeight: "500" },
  actionButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  checkInButton: { backgroundColor: "#22c55e" },
  checkOutButton: { backgroundColor: "#ef4444" },
  buttonDisabled: { opacity: 0.6 },
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
