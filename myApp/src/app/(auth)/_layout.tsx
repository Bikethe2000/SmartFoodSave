/**
 * app/(auth)/_layout.tsx
 *
 * Layout for the unauthenticated stack (login, signup).
 * No header — screens handle their own chrome.
 */
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}