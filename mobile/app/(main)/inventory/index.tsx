import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useInventoryStore } from "../../../src/store/inventory-store";

export default function InventorySearchScreen() {
  const { items, loading, searchItems } = useInventoryStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      searchItems(query.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or barcode..."
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push("/(main)/inventory/scan")}
      >
        <Text style={styles.scanButtonText}>📱 Scan Barcode</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(main)/inventory/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.quantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.meta}>
              {item.barcode} · {item.category.replace("_", " ")}
            </Text>
            {item.location && (
              <Text style={styles.location}>{item.location}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              {query ? "No items found" : "Search for inventory items"}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchButtonText: { color: "#fff", fontWeight: "600" },
  scanButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  scanButtonText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: { fontSize: 15, fontWeight: "600", color: "#1e293b", flex: 1 },
  quantity: { fontSize: 14, fontWeight: "600", color: "#1a56db" },
  meta: { fontSize: 12, color: "#64748b", textTransform: "capitalize" },
  location: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15 },
});
