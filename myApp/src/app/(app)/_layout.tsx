/**
 * app/(app)/_layout.tsx
 *
 * Layout for authenticated screens.
 * Add a tab bar or drawer here once you have more screens.
 */
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle:      { backgroundColor: "#f0fdf4" },
        headerTintColor:  "#059669",
        headerTitleStyle: { fontWeight: "700" },
      }}
    />
  );
}