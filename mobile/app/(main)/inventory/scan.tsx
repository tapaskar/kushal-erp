import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useInventoryStore } from "../../../src/store/inventory-store";

export default function BarcodeScanScreen() {
  const router = useRouter();
  const { searchByBarcode, items } = useInventoryStore();
  const [barcode, setBarcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  const handleBarcodeFound = async (code: string) => {
    if (scannedRef.current || !code.trim()) return;
    scannedRef.current = true;
    setScannerActive(false);

    setSearching(true);
    try {
      await searchByBarcode(code.trim());
      const store = useInventoryStore.getState();
      if (store.items.length > 0) {
        router.replace(`/(main)/inventory/${store.items[0].id}`);
      } else {
        Alert.alert("Not Found", "No item found with this barcode", [
          { text: "Scan Again", onPress: () => { scannedRef.current = false; setScannerActive(true); } },
        ]);
      }
    } catch {
      Alert.alert("Error", "Search failed", [
        { text: "Retry", onPress: () => { scannedRef.current = false; setScannerActive(true); } },
      ]);
    } finally {
      setSearching(false);
    }
  };

  const handleManualSearch = async () => {
    if (!barcode.trim()) {
      Alert.alert("Error", "Enter a barcode to search");
      return;
    }
    await handleBarcodeFound(barcode.trim());
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {permission.granted && scannerActive ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "qr"],
            }}
            onBarcodeScanned={(result) => handleBarcodeFound(result.data)}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>Point camera at barcode</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.cameraPlaceholder}
          onPress={permission.granted ? () => { scannedRef.current = false; setScannerActive(true); } : requestPermission}
        >
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>
            {permission.granted ? "Tap to scan again" : "Tap to enable camera"}
          </Text>
          {!permission.granted && (
            <Text style={styles.cameraSubtext}>
              Camera permission required for scanning
            </Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.manualSection}>
        <Text style={styles.label}>Manual Barcode Entry</Text>
        <TextInput
          style={styles.input}
          value={barcode}
          onChangeText={setBarcode}
          placeholder="Enter barcode..."
          onSubmitEditing={handleManualSearch}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.searchButton, searching && { opacity: 0.6 }]}
          onPress={handleManualSearch}
          disabled={searching}
        >
          <Text style={styles.searchButtonText}>
            {searching ? "Searching..." : "Search"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  cameraContainer: {
    borderRadius: 16,
    height: 280,
    overflow: "hidden",
    marginBottom: 24,
    position: "relative",
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 220,
    height: 140,
    borderWidth: 2,
    borderColor: "#1a56db",
    borderRadius: 12,
  },
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
    marginBottom: 24,
  },
  cameraIcon: { fontSize: 48, marginBottom: 8 },
  cameraText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cameraSubtext: { color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 4 },
  manualSection: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  searchButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  permissionText: { textAlign: "center", marginTop: 100, fontSize: 16, color: "#64748b" },
});
