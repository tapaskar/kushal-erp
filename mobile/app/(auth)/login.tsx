import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../src/store/auth-store";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Icon } from "../../src/components/ui/Icon";
import { colors, typography, spacing, radii } from "../../src/theme";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter phone number and password");
      return;
    }

    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (error: any) {
      const message =
        error?.response?.data?.error || "Login failed. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Icon name="home" size={32} color={colors.textOnPrimary} filled />
        </LinearGradient>
        <Text style={styles.title}>KushalRWA</Text>
        <Text style={styles.subtitle}>Society Management</Text>
      </View>

      <Card variant="elevated" padding="xl">
        <Text style={styles.formTitle}>Sign In</Text>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor={colors.textMuted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={{ marginTop: spacing.xxl }}>
          <Button
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading}
          />
        </View>

        <Text style={styles.helpText}>
          Contact your society admin if you don't have login credentials.
        </Text>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: radii.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  formTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  helpText: {
    textAlign: "center",
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.lg,
  },
});
