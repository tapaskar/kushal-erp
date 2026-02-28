import React from "react";
import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ScreenContainer({
  children,
  scroll = false,
  padding = true,
  refreshing = false,
  onRefresh,
}: ScreenContainerProps) {
  const contentStyle = padding ? styles.padded : undefined;

  if (scroll) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={contentStyle}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, contentStyle]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    padding: spacing.lg,
  },
});
