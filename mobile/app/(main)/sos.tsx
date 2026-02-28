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
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Icon } from "../../src/components/ui/Icon";
import { colors, typography, spacing, radii, shadows } from "../../src/theme";

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
        <Card variant="elevated" padding="xl">
          <View style={styles.sentContent}>
            <View style={styles.sentIconCircle}>
              <Icon name="check-circle" size={48} color={colors.success} filled />
            </View>
            <Text style={styles.sentTitle}>SOS Alert Sent</Text>
            <Text style={styles.sentDescription}>
              Help is on the way. Stay safe and stay at your current location if possible.
            </Text>
            <Button
              title="Send Another Alert"
              onPress={() => {
                setSent(false);
                setMessage("");
              }}
              variant="secondary"
              icon="refresh"
            />
          </View>
        </Card>
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
        placeholderTextColor={colors.textMuted}
        multiline
      />

      <TouchableOpacity
        style={[styles.sosButton, sending && { opacity: 0.6 }]}
        onPress={handleSos}
        disabled={sending}
      >
        <Icon name="sos" size={48} color={colors.textOnPrimary} filled />
        <Text style={styles.sosText}>
          {sending ? "SENDING..." : "SEND SOS"}
        </Text>
      </TouchableOpacity>

      <View style={styles.noteRow}>
        <Icon name="location" size={14} color={colors.textMuted} />
        <Text style={styles.note}>
          Your GPS location will be automatically shared with the alert.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: "center",
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    height: 80,
    marginBottom: spacing.xxxl,
    textAlignVertical: "top",
    color: colors.textPrimary,
  },
  sosButton: {
    backgroundColor: colors.errorDark,
    borderRadius: 100,
    width: 200,
    height: 200,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.errorDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  sosText: {
    color: colors.textOnPrimary,
    ...typography.h3,
    fontWeight: "bold",
    marginTop: spacing.sm,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xxl,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sentContent: {
    alignItems: "center",
  },
  sentIconCircle: {
    marginBottom: spacing.lg,
  },
  sentTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sentDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
});
