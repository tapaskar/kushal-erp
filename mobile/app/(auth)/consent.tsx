import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";

export default function ConsentScreen() {
  const [loading, setLoading] = useState(false);
  const { updateConsent, logout, staff } = useAuthStore();
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    try {
      await updateConsent(true);
      router.replace("/(main)");
    } catch {
      Alert.alert("Error", "Failed to record consent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      "Location Tracking Required",
      "Location tracking consent is required for staff duty verification. Without consent, you cannot use the app. You can contact your society admin for more information.",
      [
        { text: "Go Back", style: "cancel" },
        {
          text: "Decline & Logout",
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Tracking Consent</Text>
        <Text style={styles.subtitle}>
          As required by the Digital Personal Data Protection Act (DPDPA), 2023
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What we track:</Text>
        <View style={styles.item}>
          <Text style={styles.bullet}>1.</Text>
          <Text style={styles.itemText}>
            Your GPS location <Text style={styles.bold}>only during your active shift</Text>.
            No tracking outside work hours.
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.bullet}>2.</Text>
          <Text style={styles.itemText}>
            Proximity to BLE beacons installed at checkpoints in the society campus.
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.bullet}>3.</Text>
          <Text style={styles.itemText}>
            Check-in/check-out time and location for shift verification.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Your rights:
        </Text>
        <View style={styles.item}>
          <Text style={styles.bullet}>-</Text>
          <Text style={styles.itemText}>
            You can view your own location data and shift history at any time.
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.bullet}>-</Text>
          <Text style={styles.itemText}>
            Location data is automatically deleted after 90 days.
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.bullet}>-</Text>
          <Text style={styles.itemText}>
            You can revoke consent at any time from your Profile settings.
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.bullet}>-</Text>
          <Text style={styles.itemText}>
            Your data is only accessible to your society admin and is never shared with third parties.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.acceptButton, loading && styles.buttonDisabled]}
        onPress={handleAccept}
        disabled={loading}
      >
        <Text style={styles.acceptButtonText}>
          {loading ? "Recording consent..." : "I Agree & Continue"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.declineButton}
        onPress={handleDecline}
        disabled={loading}
      >
        <Text style={styles.declineButtonText}>Decline</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    marginBottom: 10,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 14,
    color: "#64748b",
    marginRight: 8,
    width: 16,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "700",
  },
  acceptButton: {
    backgroundColor: "#1a56db",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  declineButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  declineButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
});
