/**
 * app/(app)/dashboard.tsx
 *
 * Placeholder — replace with your real Dashboard screen.
 */
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function DashboardScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🥗</Text>
      <Text style={styles.title}>SmartFoodSave</Text>
      <Text style={styles.subtitle}>You're signed in!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    gap: 12,
    padding: 32,
  },
  emoji:    { fontSize: 56 },
  title:    { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 15, color: "#6b7280", marginBottom: 16 },
  button: {
    borderWidth: 1.5,
    borderColor: "#059669",
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 32,
  },
  buttonText: { color: "#059669", fontWeight: "700", fontSize: 15 },
});