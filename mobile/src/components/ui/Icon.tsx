import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme";

export type IconName =
  | "home"
  | "tasks"
  | "shield"
  | "clock"
  | "person"
  | "visitors"
  | "cleaning"
  | "inventory"
  | "reports"
  | "camera"
  | "sos"
  | "location"
  | "arrow-back"
  | "chevron-right"
  | "check-circle"
  | "incident"
  | "qr-scan"
  | "search"
  | "add"
  | "barcode"
  | "send"
  | "refresh"
  | "close"
  | "star"
  | "calendar"
  | "document"
  | "settings";

// Mapping from semantic name → Ionicons glyph (outline + filled)
const ioniconsMap: Record<
  string,
  { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }
> = {
  home: { outline: "home-outline", filled: "home" },
  tasks: { outline: "clipboard-outline", filled: "clipboard" },
  shield: { outline: "shield-checkmark-outline", filled: "shield-checkmark" },
  clock: { outline: "time-outline", filled: "time" },
  person: { outline: "person-outline", filled: "person" },
  visitors: { outline: "people-outline", filled: "people" },
  inventory: { outline: "cube-outline", filled: "cube" },
  reports: { outline: "bar-chart-outline", filled: "bar-chart" },
  camera: { outline: "camera-outline", filled: "camera" },
  sos: { outline: "alert-circle-outline", filled: "alert-circle" },
  location: { outline: "location-outline", filled: "location" },
  "arrow-back": { outline: "arrow-back", filled: "arrow-back" },
  "chevron-right": { outline: "chevron-forward", filled: "chevron-forward" },
  "check-circle": { outline: "checkmark-circle-outline", filled: "checkmark-circle" },
  incident: { outline: "warning-outline", filled: "warning" },
  "qr-scan": { outline: "qr-code-outline", filled: "qr-code" },
  search: { outline: "search-outline", filled: "search" },
  add: { outline: "add-outline", filled: "add" },
  barcode: { outline: "barcode-outline", filled: "barcode" },
  send: { outline: "send-outline", filled: "send" },
  refresh: { outline: "refresh-outline", filled: "refresh" },
  close: { outline: "close-outline", filled: "close" },
  star: { outline: "star-outline", filled: "star" },
  calendar: { outline: "calendar-outline", filled: "calendar" },
  document: { outline: "document-text-outline", filled: "document-text" },
  settings: { outline: "settings-outline", filled: "settings" },
};

// Icons that use MaterialCommunityIcons instead
const materialMap: Record<
  string,
  { outline: keyof typeof MaterialCommunityIcons.glyphMap; filled: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  cleaning: { outline: "broom", filled: "broom" },
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
}

export function Icon({
  name,
  size = 22,
  color = colors.textPrimary,
  filled = false,
}: IconProps) {
  // Check MaterialCommunityIcons first
  if (name in materialMap) {
    const glyph = materialMap[name];
    return (
      <MaterialCommunityIcons
        name={filled ? glyph.filled : glyph.outline}
        size={size}
        color={color}
      />
    );
  }

  // Default to Ionicons
  const glyph = ioniconsMap[name];
  if (!glyph) {
    return <Ionicons name="help-circle-outline" size={size} color={color} />;
  }

  return (
    <Ionicons
      name={filled ? glyph.filled : glyph.outline}
      size={size}
      color={color}
    />
  );
}
