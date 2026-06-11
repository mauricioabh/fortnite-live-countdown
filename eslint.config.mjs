import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/node_modules/**",
      "apps/mobile/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript").map((config) => ({
    ...config,
    files: ["apps/web/**/*.{ts,tsx}"],
  })),
  {
    files: ["packages/**/*.{ts,tsx}"],
    extends: ["plugin:@typescript-eslint/recommended"],
  },
];
