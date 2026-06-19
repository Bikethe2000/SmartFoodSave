/**
 * app/(auth)/login.tsx
 */
import { useRouter } from "expo-router";
import LoginScreen from "../../auth/LoginScreen";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginScreen
      onLoginSuccess={() => router.replace("/(app)/dashboard")}
      onNavigateSignup={() => router.push("/(auth)/signup")}
    />
  );
}