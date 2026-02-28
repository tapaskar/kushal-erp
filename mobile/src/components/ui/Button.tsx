import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Icon, type IconName } from "./Icon";
import { colors, radii, spacing, typography } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: colors.primary, text: colors.textOnPrimary },
  secondary: { bg: colors.surfaceSecondary, text: colors.textPrimary },
  success: { bg: colors.success, text: colors.textOnPrimary },
  danger: { bg: colors.error, text: colors.textOnPrimary },
  outline: { bg: "transparent", text: colors.error, border: colors.error },
  ghost: { bg: "transparent", text: colors.primary },
};

const sizeStyles: Record<
  ButtonSize,
  { paddingV: number; paddingH: number; fontSize: number }
> = {
  sm: { paddingV: spacing.sm, paddingH: spacing.md, fontSize: 13 },
  md: { paddingV: spacing.md, paddingH: spacing.lg, fontSize: 14 },
  lg: { paddingV: spacing.lg, paddingH: spacing.xl, fontSize: 16 },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    backgroundColor: v.bg,
    paddingVertical: s.paddingV,
    paddingHorizontal: s.paddingH,
    borderRadius: radii.lg,
    opacity: isDisabled ? 0.6 : 1,
    ...(v.border ? { borderWidth: 1.5, borderColor: v.border } : {}),
    ...(fullWidth ? {} : { alignSelf: "flex-start" as const }),
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      style={[animatedStyle, styles.base, buttonStyle]}
    >
      {loading ? (
        <ActivityIndicator
          color={v.text}
          size="small"
          style={{ marginRight: spacing.sm }}
        />
      ) : icon ? (
        <View style={{ marginRight: spacing.sm }}>
          <Icon name={icon} size={s.fontSize + 2} color={v.text} />
        </View>
      ) : null}
      <Text
        style={[
          styles.label,
          {
            color: v.text,
            fontSize: s.fontSize,
            fontWeight: "600",
          },
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});
