/**
 * app/_layout.tsx
 *
 * Expo Router root layout.
 * - Wraps the whole app in AuthProvider
 * - Reads auth state and redirects to the right stack
 */
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RouteGuard() {
  const { userToken, loading } = useAuth();
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!userToken && !inAuthGroup) {
      // Not signed in — send to login
      router.replace("/(auth)/login");
    } else if (userToken && inAuthGroup) {
      // Already signed in — send to app
      router.replace("/(app)/dashboard");
    }
  }, [userToken, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard />
    </AuthProvider>
  );
}