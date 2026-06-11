import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "**/.next/**",
    "**/dist/**",
    "**/node_modules/**",
    "apps/mobile/**",
  ]),
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [...nextVitals, ...nextTs],
  },
  {
    files: ["packages/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
  },
]);
