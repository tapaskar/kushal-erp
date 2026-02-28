import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuthStore } from "../../src/store/auth-store";
import { STAFF_ROLES } from "../../src/lib/constants";

export default function ProfileScreen() {
  const { staff, society, logout, updateConsent } = useAuthStore();

  const handleRevokeConsent = () => {
    Alert.alert(
      "Revoke Location Consent",
      "This will stop location tracking. You will still be able to use the app for tasks but location verification will be disabled.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () => updateConsent(false),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {staff?.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.name}>{staff?.name}</Text>
        <Text style={styles.role}>
          {STAFF_ROLES[staff?.role || ""] || staff?.role}
        </Text>
        <Text style={styles.society}>{society?.name}</Text>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsCard}>
          <DetailRow label="Employee Code" value={staff?.employeeCode || "-"} />
          <DetailRow label="Phone" value={staff?.phone || "-"} />
          <DetailRow label="Email" value={staff?.email || "-"} />
          <DetailRow label="Department" value={staff?.department || "-"} />
          {staff?.contractorName && (
            <DetailRow label="Contractor" value={staff.contractorName} />
          )}
          {staff?.employedSince && (
            <DetailRow label="Employed Since" value={staff.employedSince} />
          )}
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Consent</Text>
        <View style={styles.detailsCard}>
          <DetailRow
            label="Location Tracking"
            value={staff?.consentGiven ? "Enabled" : "Disabled"}
          />
          {staff?.consentGiven ? (
            <TouchableOpacity
              style={styles.revokeButton}
              onPress={handleRevokeConsent}
            >
              <Text style={styles.revokeButtonText}>
                Revoke Location Consent
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.enableButton}
              onPress={() => updateConsent(true)}
            >
              <Text style={styles.enableButtonText}>
                Enable Location Tracking
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.privacyNote}>
            Location data is automatically deleted after 90 days. Only your
            society admin can view your location history.
          </Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>RWA Staff Tracker v1.0.0</Text>
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  profileCard: {
    backgroundColor: "#1a56db",
    padding: 24,
    alignItems: "center",
    paddingTop: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  name: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  role: { color: "#bfdbfe", fontSize: 14, marginTop: 4 },
  society: { color: "#93c5fd", fontSize: 13, marginTop: 2 },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: { fontSize: 13, color: "#64748b" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
  revokeButton: {
    marginTop: 12,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  revokeButtonText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
  enableButton: {
    marginTop: 12,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#dbeafe",
  },
  enableButtonText: { color: "#1a56db", fontWeight: "600", fontSize: 14 },
  privacyNote: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 10,
    lineHeight: 18,
  },
  logoutButton: {
    margin: 16,
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  logoutButtonText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
  version: {
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 8,
  },
});
