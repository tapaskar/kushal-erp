import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radii } from "@/theme";

interface BadgeProps {
  label: string;
  color: string;
  variant?: "soft" | "solid";
  size?: "sm" | "md";
}

export function Badge({
  label,
  color,
  variant = "soft",
  size = "md",
}: BadgeProps) {
  const isSoft = variant === "soft";

  return (
    <View
      style={[
        styles.base,
        size === "sm" && styles.sm,
        {
          backgroundColor: isSoft ? color + "18" : color,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          size === "sm" && styles.labelSm,
          { color: isSoft ? color : "#fff" },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.sm,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  labelSm: {
    fontSize: 10,
  },
});
