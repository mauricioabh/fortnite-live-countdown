import { Stack } from "expo-router";

import { colors } from "@fortnite-live-countdown/ui";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitle: "",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
