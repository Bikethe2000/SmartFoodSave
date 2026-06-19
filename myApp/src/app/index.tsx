/**
 * app/index.tsx
 *
 * Immediately redirects based on auth state.
 * The actual redirect logic lives in _layout.tsx (RouteGuard),
 * but Expo Router requires a file at the index route.
 */
import { Redirect } from "expo-router";

export default function Index() {
  // RouteGuard in _layout.tsx handles the real redirect.
  // This is just a fallback so the route resolves.
  return <Redirect href="/(auth)/login" />;
}