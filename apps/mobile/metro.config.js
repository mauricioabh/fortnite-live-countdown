const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { resolve } = require("metro-resolver");

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

// Support TS path alias "@/*" -> "./src/*" (see tsconfig.json)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    const rewritten = path.join(projectRoot, "src", moduleName.slice(2));
    return resolve(context, rewritten, platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
