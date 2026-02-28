// ── Centralized Design Tokens ──────────────────────────────────────
// Single source of truth for all visual constants in the app.

export const colors = {
  // Primary
  primary: "#1a56db",
  primaryDark: "#1e40af",
  primaryLight: "#3b82f6",
  primaryBg: "#dbeafe",
  primaryBgLight: "#eff6ff",

  // Neutrals (slate palette)
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceSecondary: "#f1f5f9",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",

  // Text
  textPrimary: "#1e293b",
  textSecondary: "#475569",
  textTertiary: "#64748b",
  textMuted: "#94a3b8",
  textOnPrimary: "#ffffff",
  textOnPrimaryMuted: "#bfdbfe",

  // Semantic
  success: "#22c55e",
  successDark: "#16a34a",
  successBg: "#dcfce7",
  warning: "#f59e0b",
  warningDark: "#d97706",
  warningBg: "#fef3c7",
  error: "#ef4444",
  errorDark: "#dc2626",
  errorBg: "#fef2f2",
  info: "#3b82f6",
  infoDark: "#2563eb",
  infoBg: "#dbeafe",

  // Accent
  purple: "#8b5cf6",
  orange: "#f97316",
} as const;

export const typography = {
  h1: { fontSize: 24, fontWeight: "700" as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: "700" as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  subtitle: { fontSize: 16, fontWeight: "700" as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: "500" as const, lineHeight: 22 },
  bodySemibold: { fontSize: 15, fontWeight: "600" as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  captionMedium: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
  captionSemibold: { fontSize: 13, fontWeight: "600" as const, lineHeight: 18 },
  overline: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  label: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
  buttonLarge: { fontSize: 16, fontWeight: "600" as const },
  buttonSmall: { fontSize: 14, fontWeight: "600" as const },
  statNumber: { fontSize: 24, fontWeight: "700" as const },
  statLabel: { fontSize: 11, fontWeight: "500" as const },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;
