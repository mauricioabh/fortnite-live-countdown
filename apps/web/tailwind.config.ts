import type { Config } from "tailwindcss";

import {
  colors,
  spacing,
  typography,
} from "@fortnite-live-countdown/ui/tokens";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        foreground: colors.foreground,
        muted: {
          DEFAULT: colors.muted,
          foreground: colors.mutedForeground,
        },
        card: {
          DEFAULT: colors.card,
          foreground: colors.cardForeground,
        },
        border: colors.border,
        input: colors.input,
        ring: colors.ring,
        primary: {
          DEFAULT: colors.primary,
          foreground: colors.primaryForeground,
        },
        secondary: {
          DEFAULT: colors.secondary,
          foreground: colors.secondaryForeground,
        },
        accent: {
          DEFAULT: colors.accent,
          foreground: colors.accentForeground,
        },
        destructive: {
          DEFAULT: colors.destructive,
          foreground: colors.destructiveForeground,
        },
        heat: {
          "red-intense": colors.heat.redIntense,
          "red-soft": colors.heat.redSoft,
          "orange-intense": colors.heat.orangeIntense,
          "orange-soft": colors.heat.orangeSoft,
          "blue-intense": colors.heat.blueIntense,
          "blue-soft": colors.heat.blueSoft,
        },
      },
      fontFamily: {
        sans: typography.fontFamily.sans.split(", "),
        mono: typography.fontFamily.mono.split(", "),
      },
      fontSize: {
        xs: [
          `${typography.fontSize.xs}px`,
          { lineHeight: String(typography.lineHeight.normal) },
        ],
        sm: [
          `${typography.fontSize.sm}px`,
          { lineHeight: String(typography.lineHeight.normal) },
        ],
        base: [
          `${typography.fontSize.base}px`,
          { lineHeight: String(typography.lineHeight.relaxed) },
        ],
        lg: [
          `${typography.fontSize.lg}px`,
          { lineHeight: String(typography.lineHeight.relaxed) },
        ],
        xl: [
          `${typography.fontSize.xl}px`,
          { lineHeight: String(typography.lineHeight.tight) },
        ],
        "2xl": [
          `${typography.fontSize["2xl"]}px`,
          { lineHeight: String(typography.lineHeight.tight) },
        ],
        "3xl": [
          `${typography.fontSize["3xl"]}px`,
          { lineHeight: String(typography.lineHeight.tight) },
        ],
        "4xl": [
          `${typography.fontSize["4xl"]}px`,
          { lineHeight: String(typography.lineHeight.tight) },
        ],
      },
      spacing: {
        xs: `${spacing.xs}px`,
        sm: `${spacing.sm}px`,
        md: `${spacing.md}px`,
        lg: `${spacing.lg}px`,
        xl: `${spacing.xl}px`,
        "2xl": `${spacing["2xl"]}px`,
        "3xl": `${spacing["3xl"]}px`,
      },
    },
  },
  plugins: [],
} satisfies Config;
