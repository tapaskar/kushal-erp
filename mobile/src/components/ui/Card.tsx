import React from "react";
import { Pressable, View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { colors, radii, spacing, shadows } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const paddingMap = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xxl,
};

export function Card({
  children,
  variant = "default",
  padding = "lg",
  onPress,
  style,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle: ViewStyle[] = [
    styles.base,
    { padding: paddingMap[padding] },
    variant === "default" && { ...shadows.sm },
    variant === "elevated" && { ...shadows.md },
    variant === "outlined" && styles.outlined,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
        style={[animatedStyle, ...cardStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[...cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
