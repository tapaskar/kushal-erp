import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { recordQrScan } from "../../src/api/location";

export default function ScanQrScreen() {
  const router = useRouter();
  const [manualId, setManualId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const [scanResult, setScanResult] = useState<{
    label: string;
    location?: string;
    floor?: number;
  } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  const handleQrData = async (data: string) => {
    if (scannedRef.current || scanning) return;
    scannedRef.current = true;
    setScannerActive(false);
    setScanning(true);

    try {
      // Expected format: rwa://beacon/{beaconId}
      let beaconId = data;
      if (data.startsWith("rwa://beacon/")) {
        beaconId = data.replace("rwa://beacon/", "");
      }

      if (!beaconId || beaconId.length < 5) {
        Alert.alert("Invalid QR", "This QR code is not a valid area beacon", [
          {
            text: "Scan Again",
            onPress: () => {
              scannedRef.current = false;
              setScannerActive(true);
            },
          },
        ]);
        setScanning(false);
        return;
      }

      const result = await recordQrScan(beaconId);
      setScanResult(result.beacon);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error || "Failed to record scan. Try again.";
      Alert.alert("Scan Failed", msg, [
        {
          text: "Scan Again",
          onPress: () => {
            scannedRef.current = false;
            setScannerActive(true);
          },
        },
      ]);
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualId.trim()) {
      Alert.alert("Error", "Enter a beacon ID");
      return;
    }
    await handleQrData(manualId.trim());
  };

  const resetScan = () => {
    scannedRef.current = false;
    setScanResult(null);
    setScannerActive(true);
    setManualId("");
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1a56db" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // Success state
  if (scanResult) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Presence Recorded</Text>
          <Text style={styles.successArea}>{scanResult.label}</Text>
          {scanResult.location && (
            <Text style={styles.successDetail}>{scanResult.location}</Text>
          )}
          {scanResult.floor !== null && scanResult.floor !== undefined && (
            <Text style={styles.successDetail}>
              Floor {scanResult.floor}
            </Text>
          )}
          <Text style={styles.successTime}>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={resetScan}>
          <Text style={styles.primaryButtonText}>Scan Another</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scan Area QR Code</Text>
      <Text style={styles.subheading}>
        Point your camera at a QR code placed in the area to mark your presence
      </Text>

      {permission.granted && scannerActive ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={(result) => handleQrData(result.data)}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            {scanning ? (
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.scanHint}> Recording presence...</Text>
              </View>
            ) : (
              <Text style={styles.scanHint}>
                Align QR code within the frame
              </Text>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.cameraPlaceholder}
          onPress={
            permission.granted
              ? () => {
                  scannedRef.current = false;
                  setScannerActive(true);
                }
              : requestPermission
          }
        >
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>
            {permission.granted ? "Tap to scan again" : "Tap to enable camera"}
          </Text>
          {!permission.granted && (
            <Text style={styles.cameraSubtext}>
              Camera permission required for QR scanning
            </Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.manualSection}>
        <Text style={styles.label}>Manual Beacon ID Entry</Text>
        <TextInput
          style={styles.input}
          value={manualId}
          onChangeText={setManualId}
          placeholder="Enter beacon ID..."
          onSubmitEditing={handleManualSubmit}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.submitButton, scanning && { opacity: 0.6 }]}
          onPress={handleManualSubmit}
          disabled={scanning}
        >
          <Text style={styles.submitButtonText}>
            {scanning ? "Recording..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subheading: { fontSize: 13, color: "#64748b", marginBottom: 16 },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  cameraContainer: {
    borderRadius: 16,
    height: 300,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#1a56db",
    borderRadius: 16,
  },
  scanningRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  scanHint: {
    color: "#fff",
    fontSize: 13,
    marginTop: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cameraPlaceholder: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cameraIcon: { fontSize: 48, marginBottom: 8 },
  cameraText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cameraSubtext: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  manualSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  // Success state
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 8,
  },
  successArea: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  successDetail: { fontSize: 14, color: "#64748b", marginTop: 2 },
  successTime: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: "#1a56db",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "600",
  },
});
