const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname; // apps/mobile
const monorepoRoot = path.resolve(projectRoot, "../.."); // repo root

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
};

module.exports = config;
