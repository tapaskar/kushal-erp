import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../src/store/auth-store";
import { STAFF_ROLES, USER_ROLES } from "../../src/lib/constants";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Icon } from "../../src/components/ui/Icon";
import { colors, typography, spacing, radii } from "../../src/theme";

export default function ProfileScreen() {
  const { staff, user, society, userType, logout, updateConsent } =
    useAuthStore();

  const isStaff = userType === "staff";
  const displayName = isStaff ? staff?.name : user?.name;
  const displayRole = isStaff
    ? STAFF_ROLES[staff?.role || ""] || staff?.role
    : USER_ROLES[user?.role || ""] || user?.role;

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
      {/* ── Profile Header ── */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.role}>{displayRole}</Text>
        <Text style={styles.society}>{society?.name}</Text>
      </LinearGradient>

      {/* ── Details ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Card>
          {isStaff ? (
            <>
              <DetailRow
                label="Employee Code"
                value={staff?.employeeCode || "-"}
              />
              <DetailRow label="Phone" value={staff?.phone || "-"} />
              <DetailRow label="Email" value={staff?.email || "-"} />
              <DetailRow label="Department" value={staff?.department || "-"} />
              {staff?.contractorName && (
                <DetailRow label="Contractor" value={staff.contractorName} />
              )}
              {staff?.employedSince && (
                <DetailRow
                  label="Employed Since"
                  value={staff.employedSince}
                  last
                />
              )}
            </>
          ) : (
            <>
              <DetailRow label="Phone" value={user?.phone || "-"} />
              <DetailRow label="Email" value={user?.email || "-"} />
              <DetailRow
                label="Role"
                value={USER_ROLES[user?.role || ""] || user?.role || "-"}
                last
              />
            </>
          )}
        </Card>
      </View>

      {/* ── Privacy (staff only) ── */}
      {isStaff && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Consent</Text>
          <Card>
            <View style={styles.consentRow}>
              <View style={styles.consentInfo}>
                <Icon
                  name="location"
                  size={18}
                  color={
                    staff?.consentGiven ? colors.success : colors.textMuted
                  }
                />
                <Text style={styles.consentLabel}>Location Tracking</Text>
              </View>
              <Text
                style={[
                  styles.consentStatus,
                  {
                    color: staff?.consentGiven
                      ? colors.success
                      : colors.textMuted,
                  },
                ]}
              >
                {staff?.consentGiven ? "Enabled" : "Disabled"}
              </Text>
            </View>

            <View style={styles.consentAction}>
              {staff?.consentGiven ? (
                <Button
                  title="Revoke Location Consent"
                  onPress={handleRevokeConsent}
                  variant="outline"
                  size="sm"
                />
              ) : (
                <Button
                  title="Enable Location Tracking"
                  onPress={() => updateConsent(true)}
                  variant="secondary"
                  size="sm"
                  icon="location"
                />
              )}
            </View>

            <Text style={styles.privacyNote}>
              Location data is automatically deleted after 90 days. Only your
              society admin can view your location history.
            </Text>
          </Card>
        </View>
      )}

      {/* ── Logout ── */}
      <View style={styles.section}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          icon="arrow-back"
        />
      </View>

      <Text style={styles.version}>KushalRWA v1.3.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileCard: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 28,
    fontWeight: "bold",
  },
  name: {
    ...typography.h2,
    color: colors.textOnPrimary,
  },
  role: {
    ...typography.caption,
    color: colors.textOnPrimaryMuted,
    marginTop: spacing.xs,
  },
  society: {
    fontSize: 13,
    color: "#93c5fd",
    marginTop: 2,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  detailValue: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  consentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  consentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  consentLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  consentStatus: {
    ...typography.captionSemibold,
  },
  consentAction: {
    marginBottom: spacing.md,
  },
  privacyNote: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  version: {
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
