import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Matches web `(main)/layout`: `bg-gradient-to-br from-zinc-950 via-red-900 to-blue-900`. */
const GRADIENT_COLORS = ["#09090b", "#7f1d1d", "#1e3a8a"] as const;

interface ScreenShellProps {
  children: ReactNode;
}

export const ScreenShell = ({ children }: ScreenShellProps) => {
  return (
    <LinearGradient colors={[...GRADIENT_COLORS]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.inner}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  inner: { flex: 1 },
});
