const { spawnSync } = require("node:child_process");
const path = require("node:path");

const isWin = process.platform === "win32";
const gradlew = isWin ? "gradlew.bat" : "./gradlew";
const androidDir = path.join(__dirname, "..", "android");

const result = spawnSync(gradlew, [":app:bundleRelease"], {
  cwd: androidDir,
  stdio: "inherit",
  shell: isWin,
});

process.exit(result.status ?? 1);
