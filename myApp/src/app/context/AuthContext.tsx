/**
 * context/AuthContext.tsx
 *
 * Typed AuthContext compatible with Expo Router.
 * Exposes useAuth() hook for consumption anywhere in the tree.
 */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthContextValue {
  userToken: string | null;
  loading:   boolean;
  login:     (token: string) => Promise<void>;
  logout:    () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setUserToken(token);
      } catch {
        // Storage failure → treat as logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (token: string) => {
    await AsyncStorage.setItem("token", token);
    setUserToken(token);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("token");
    setUserToken(null);
  }, []);

  // Show a green splash while AsyncStorage hydrates.
  // This prevents the router guard from redirecting before we know auth state.
  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ userToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
});