/**
 * app/(auth)/signup.tsx
 */
import { useRouter } from "expo-router";
import SignupScreen from "../../auth/AuthScreens";

export default function SignupPage() {
  const router = useRouter();

  return (
    <SignupScreen
      onSignupSuccess={() => router.replace("/(app)/dashboard")}
      onNavigateLogin={() => router.back()}
    />
  );
}