/**
 * Design tokens — source of truth for web (Tailwind) and mobile (NativeWind).
 * Heat scale matches PRD: red intense → red soft → orange intense → orange soft → blue intense → blue soft.
 */

export const colors = {
  background: "#050508",
  foreground: "#f4f4f5",
  muted: "#a1a1aa",
  mutedForeground: "#71717a",
  card: "#0c0c0f",
  cardForeground: "#f4f4f5",
  border: "#27272a",
  input: "#27272a",
  ring: "#3b82f6",
  primary: "#3b82f6",
  primaryForeground: "#ffffff",
  secondary: "#18181b",
  secondaryForeground: "#fafafa",
  accent: "#27272a",
  accentForeground: "#fafafa",
  destructive: "#ef4444",
  destructiveForeground: "#fafafa",
  /** Countdown / urgency gradient stops (left → right in UI maps to time pressure). */
  heat: {
    redIntense: "#b91c1c",
    redSoft: "#f87171",
    orangeIntense: "#c2410c",
    orangeSoft: "#fdba74",
    blueIntense: "#1d4ed8",
    blueSoft: "#93c5fd",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;
