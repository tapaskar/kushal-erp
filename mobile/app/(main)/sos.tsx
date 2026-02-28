import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import * as securityApi from "../../src/api/security";

export default function SosScreen() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSos = async () => {
    Alert.alert(
      "Send SOS Alert?",
      "This will alert all supervisors and security staff immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SEND SOS",
          style: "destructive",
          onPress: async () => {
            setSending(true);
            try {
              let latitude: string | undefined;
              let longitude: string | undefined;

              try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                  const loc = await Location.getCurrentPositionAsync({});
                  latitude = loc.coords.latitude.toString();
                  longitude = loc.coords.longitude.toString();
                }
              } catch {
                // Continue without location
              }

              await securityApi.triggerSos({
                latitude,
                longitude,
                message: message || "Emergency SOS Alert",
              });

              setSent(true);
              Alert.alert("SOS Sent", "Your alert has been sent to all supervisors.");
            } catch {
              Alert.alert("Error", "Failed to send SOS alert. Please try again.");
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.sentCard}>
          <Text style={styles.sentIcon}>✅</Text>
          <Text style={styles.sentTitle}>SOS Alert Sent</Text>
          <Text style={styles.sentDescription}>
            Help is on the way. Stay safe and stay at your current location if possible.
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSent(false);
              setMessage("");
            }}
          >
            <Text style={styles.resetButtonText}>Send Another Alert</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Emergency SOS</Text>
      <Text style={styles.subtitle}>
        Press the button below to immediately alert all supervisors and security personnel.
      </Text>

      <TextInput
        style={styles.messageInput}
        value={message}
        onChangeText={setMessage}
        placeholder="Optional: describe the emergency..."
        multiline
      />

      <TouchableOpacity
        style={[styles.sosButton, sending && { opacity: 0.6 }]}
        onPress={handleSos}
        disabled={sending}
      >
        <Text style={styles.sosIcon}>🚨</Text>
        <Text style={styles.sosText}>
          {sending ? "SENDING..." : "SEND SOS"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Your GPS location will be automatically shared with the alert.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16, justifyContent: "center" },
  heading: { fontSize: 24, fontWeight: "bold", color: "#1e293b", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginTop: 8, marginBottom: 24 },
  messageInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 80,
    marginBottom: 32,
    textAlignVertical: "top",
  },
  sosButton: {
    backgroundColor: "#dc2626",
    borderRadius: 100,
    width: 200,
    height: 200,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sosIcon: { fontSize: 48, marginBottom: 8 },
  sosText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  note: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 24 },
  sentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  sentIcon: { fontSize: 48, marginBottom: 16 },
  sentTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
  sentDescription: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 24 },
  resetButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetButtonText: { fontSize: 14, fontWeight: "600", color: "#475569" },
});
