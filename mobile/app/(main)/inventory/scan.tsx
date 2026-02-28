import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useInventoryStore } from "../../../src/store/inventory-store";

export default function BarcodeScanScreen() {
  const router = useRouter();
  const { searchByBarcode, items } = useInventoryStore();
  const [barcode, setBarcode] = useState("");
  const [searching, setSearching] = useState(false);

  // Manual barcode entry as fallback (camera-based scan requires expo-camera setup)
  const handleSearch = async () => {
    if (!barcode.trim()) {
      Alert.alert("Error", "Enter a barcode to search");
      return;
    }
    setSearching(true);
    try {
      await searchByBarcode(barcode.trim());
      // If item found, navigate to it
      if (items.length > 0) {
        router.replace(`/(main)/inventory/${items[0].id}`);
      } else {
        Alert.alert("Not Found", "No item found with this barcode");
      }
    } catch {
      Alert.alert("Error", "Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraIcon}>📷</Text>
        <Text style={styles.cameraText}>Camera barcode scanning</Text>
        <Text style={styles.cameraSubtext}>
          Requires expo-camera module.{"\n"}Use manual entry below.
        </Text>
      </View>

      <View style={styles.manualSection}>
        <Text style={styles.label}>Manual Barcode Entry</Text>
        <TextInput
          style={styles.input}
          value={barcode}
          onChangeText={setBarcode}
          placeholder="Enter barcode..."
          onSubmitEditing={handleSearch}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.searchButton, searching && { opacity: 0.6 }]}
          onPress={handleSearch}
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
});
