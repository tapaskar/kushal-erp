import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/auth-store";
import { View, ActivityIndicator } from "react-native";
import { colors } from "../src/theme";

export default function RootLayout() {
  const { isAuthenticated, isLoading, initialize, staff, userType } =
    useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Only staff needs consent screen; user roles skip consent
      if (userType === "staff" && staff && !staff.consentGiven) {
        router.replace("/(auth)/consent");
      } else {
        router.replace("/(main)");
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.surface,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <Slot />
    </>
  );
}
