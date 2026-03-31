const { spawnSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.join(__dirname, ".."); // apps/mobile
const monorepoRoot = path.join(projectRoot, "..", ".."); // repo root

const entryFile = path.join(monorepoRoot, "node_modules", "expo-router", "entry.js");
const metroConfig = path.join(projectRoot, "metro.config.js");
const bundleOutput = path.join(
  projectRoot,
  "android",
  "app",
  "src",
  "main",
  "assets",
  "index.android.bundle",
);
const assetsDest = path.join(projectRoot, "android", "app", "src", "main", "res");

const result = spawnSync(
  "react-native",
  [
    "bundle",
    "--platform",
    "android",
    "--dev",
    "false",
    "--entry-file",
    entryFile,
    "--bundle-output",
    bundleOutput,
    "--assets-dest",
    assetsDest,
    "--config",
    metroConfig,
  ],
  {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

process.exit(result.status ?? 1);

