import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/auth-store";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { isAuthenticated, isLoading, initialize, staff } = useAuthStore();
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
      // Check if consent is needed
      if (staff && !staff.consentGiven) {
        router.replace("/(auth)/consent");
      } else {
        router.replace("/(main)");
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#1a56db" />
      <Slot />
    </>
  );
}
