/**
 * auth/SignupScreen.tsx  &  auth/LoginScreen.tsx
 *
 * Drop these two exports wherever you keep your auth screens.
 * Usage (Expo Router):
 *
 *   // app/(auth)/signup.tsx
 *   import SignupScreen from "../../auth/AuthScreens";
 *   export default function SignupPage() { … }
 *
 *   // app/(auth)/login.tsx
 *   import { LoginScreen } from "../../auth/AuthScreens";
 *   export default function LoginPage() { … }
 */

import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
  AccessibilityInfo,
} from "react-native";

// ─── Config ──────────────────────────────────────────────────────────────────
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://foodwasteai-production.up.railway.app";

// ─── Palette (emerald brand, matches the web UI) ───────────────────────────
const C = {
  emerald600:  "#059669",
  emerald700:  "#047857",
  emerald100:  "#D1FAE5",
  emerald50:   "#ECFDF5",
  red50:       "#FEF2F2",
  red200:      "#FECACA",
  red600:      "#DC2626",
  gray50:      "#F9FAFB",
  gray100:     "#F3F4F6",
  gray200:     "#E5E7EB",
  gray300:     "#D1D5DB",
  gray400:     "#9CA3AF",
  gray500:     "#6B7280",
  gray700:     "#374151",
  gray900:     "#111827",
  white:       "#FFFFFF",

  // strength ramp
  red400:      "#F87171",
  orange400:   "#FB923C",
  yellow400:   "#FACC15",
  green400:    "#4ADE80",
  green600:    "#16A34A",
};

// ─── Regexes ─────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_RE   = /^\d{6}$/;

// ─── Password strength ────────────────────────────────────────────────────────
function calcStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (pw.length >= 12)         s++;
  if (/[A-Z]/.test(pw))       s++;
  if (/[0-9]/.test(pw))       s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABELS = ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"];
const STRENGTH_SEGMENT = ["", C.red400, C.orange400, C.yellow400, C.green400, C.green600];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = calcStrength(password);
  const textColor = score <= 2 ? C.red600 : score === 3 ? "#92400E" : C.green600;
  return (
    <View style={{ marginTop: 8 }} accessibilityLiveRegion="polite">
      <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= score ? STRENGTH_SEGMENT[score] : C.gray200,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 12, color: textColor, fontWeight: "500" }}>
        {STRENGTH_LABELS[score]}
        {score < 3 && score > 0 ? " — add uppercase, numbers, or symbols" : ""}
      </Text>
    </View>
  );
}

// ─── Validators ───────────────────────────────────────────────────────────────
function validateName(v: string): string | null {
  if (!v) return "Full name is required.";
  if (v.length < 2) return "Name must be at least 2 characters.";
  if (v.length > 100) return "Name is too long.";
  if (/[<>]/.test(v)) return "Name contains invalid characters.";
  return null;
}
function validateEmail(v: string): string | null {
  if (!v) return "Email is required.";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address.";
  if (v.length > 254) return "Email address is too long.";
  return null;
}
function validatePassword(v: string): string | null {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (v.length > 128) return "Password is too long.";
  if (calcStrength(v) < 2) return "Too weak — add uppercase letters or numbers.";
  return null;
}
function validateOtp(v: string): string | null {
  if (!v) return "Verification code is required.";
  if (!OTP_RE.test(v)) return "Code must be exactly 6 digits.";
  return null;
}

function sanitize(s: string) { return s.trim().replace(/\0/g, ""); }

// ─── Shared UI primitives ────────────────────────────────────────────────────
function FieldLabel({ text }: { text: string }) {
  return <Text style={s.label}>{text}</Text>;
}

function FieldError({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return <Text style={s.fieldError} accessibilityRole="alert">{msg}</Text>;
}

function Banner({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <View style={s.banner} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Text style={s.bannerIcon}>⚠️</Text>
      <Text style={s.bannerText}>{msg}</Text>
    </View>
  );
}

interface InputProps {
  id?: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoComplete?: "off" | "email" | "name" | "password" | "one-time-code" | "new-password";
  autoCapitalize?: "none" | "sentences" | "words";
  maxLength?: number;
  hasError?: boolean;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  textAlign?: "left" | "center";
  returnKeyType?: "next" | "done" | "go";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}
function Field(props: InputProps) {
  const border = props.hasError ? C.red600 : C.gray300;
  const focusBorder = props.hasError ? C.red600 : C.emerald600;
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        s.inputWrap,
        { borderColor: focused ? focusBorder : border },
        props.disabled ? s.inputDisabled : null,
      ]}
    >
      <TextInput
        ref={props.inputRef}
        style={[
          s.input,
          props.rightSlot ? { paddingRight: 44 } : null,
          props.textAlign === "center" ? { textAlign: "center", letterSpacing: 6 } : null,
        ]}
        value={props.value}
        onChangeText={props.onChangeText}
        onBlur={() => { setFocused(false); props.onBlur?.(); }}
        onFocus={() => setFocused(true)}
        placeholder={props.placeholder}
        placeholderTextColor={C.gray400}
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType ?? "default"}
        autoComplete={props.autoComplete}
        autoCapitalize={props.autoCapitalize ?? "none"}
        autoCorrect={false}
        maxLength={props.maxLength}
        editable={!props.disabled}
        returnKeyType={props.returnKeyType}
        onSubmitEditing={props.onSubmitEditing}
        accessibilityState={{ disabled: props.disabled }}
      />
      {props.rightSlot && (
        <View style={s.inputRightSlot}>{props.rightSlot}</View>
      )}
    </View>
  );
}

function EyeToggle({ show, onPress }: { show: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={show ? "Hide password" : "Show password"}
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={{ fontSize: 18, color: C.gray400 }}>{show ? "🙈" : "👁️"}</Text>
    </TouchableOpacity>
  );
}

function PrimaryButton({
  label,
  loading,
  loadingLabel,
  onPress,
  disabled,
}: {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[s.btn, (disabled || loading) && s.btnDisabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading
        ? <>
            <ActivityIndicator color={C.white} size="small" style={{ marginRight: 8 }} />
            <Text style={s.btnText}>{loadingLabel ?? label}</Text>
          </>
        : <Text style={s.btnText}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ─── OTP Cooldown hook ────────────────────────────────────────────────────────
const OTP_COOLDOWN_MS = 60_000;
const otpState = { lastSent: 0 };

function useOtpCooldown() {
  const [secs, setSecs] = useState(0);
  const start = useCallback(() => {
    otpState.lastSent = Date.now();
    let remaining = Math.ceil(OTP_COOLDOWN_MS / 1000);
    setSecs(remaining);
    const iv = setInterval(() => {
      remaining--;
      setSecs(remaining);
      if (remaining <= 0) clearInterval(iv);
    }, 1000);
  }, []);
  return { cooldown: secs, startCooldown: start };
}

// ─── api stub (same shape as the web api.ts) ────────────────────────────────
// Replace with your real api module import
const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ?? "Login failed.");
    }
    return res.json();
  },
  async getSettings() {
    const res = await fetch(`${API_BASE}/api/settings`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Could not fetch settings.");
    return res.json();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGNUP SCREEN
// ─────────────────────────────────────────────────────────────────────────────

interface SignupProps {
  onSignupSuccess: () => void;
  onNavigateLogin: () => void;
}

export default function SignupScreen({ onSignupSuccess, onNavigateLogin }: SignupProps) {
  type Step = "form" | "otp";
  const [step, setStep]           = useState<Step>("form");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [otp, setOtp]             = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCpw, setShowCpw]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]     = useState(false);
  const { cooldown, startCooldown } = useOtpCooldown();

  const emailRef   = useRef<TextInput>(null);
  const pwRef      = useRef<TextInput>(null);
  const cpwRef     = useRef<TextInput>(null);
  const otpRef     = useRef<TextInput>(null);

  const clearFieldError = (field: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: null }));

  const validateField = useCallback((field: string, value: string) => {
    const validators: Record<string, (v: string) => string | null> = {
      name:      validateName,
      email:     validateEmail,
      password:  validatePassword,
      confirmPw: (v) => v !== password ? "Passwords do not match." : null,
    };
    const err = validators[field]?.(value) ?? null;
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  }, [password]);

  // Step 1 — send OTP
  const sendOtp = useCallback(async () => {
    setSubmitError("");
    const cn = sanitize(name), ce = sanitize(email),
          cp = sanitize(password), cc = sanitize(confirmPw);

    const errs = {
      name:      validateName(cn),
      email:     validateEmail(ce),
      password:  validatePassword(cp),
      confirmPw: cc !== cp ? "Passwords do not match." : null,
    };
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const elapsed = Date.now() - otpState.lastSent;
    if (elapsed < OTP_COOLDOWN_MS) {
      setSubmitError(`Wait ${Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000)}s before requesting another code.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cn, email: ce }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to send verification code.");
      }
      startCooldown();
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirmPw, startCooldown]);

  // Step 2 — verify OTP
  const verifyOtp = useCallback(async () => {
    setSubmitError("");
    const cleanOtp = sanitize(otp);
    const otpErr   = validateOtp(cleanOtp);
    if (otpErr) { setFieldErrors(prev => ({ ...prev, otp: otpErr })); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     sanitize(name),
          email:    sanitize(email),
          password: sanitize(password),
          otp:      cleanOtp,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Invalid or expired verification code.");
      }
      await api.login(sanitize(email), sanitize(password));
      onSignupSuccess();
    } catch (err: any) {
      setSubmitError(err.message ?? "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otp, name, email, password, onSignupSuccess]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.screen}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand mark */}
        <View style={s.logoWrap}>
          <View style={s.logoCircle}>
            <Text style={{ fontSize: 28 }}>🥗</Text>
          </View>
          <Text style={s.appName}>SmartFoodSave</Text>
        </View>

        <View style={s.card}>
          <Text style={s.heading}>
            {step === "form" ? "Create your account" : "Check your email"}
          </Text>
          <Text style={s.subheading}>
            {step === "form"
              ? "Join SmartFoodSave today"
              : `We sent a 6-digit code to ${email}`}
          </Text>

          <Banner msg={submitError} />

          {/* ── Step 1 ─────────────────────────────────────────── */}
          {step === "form" && (
            <>
              <View style={s.fieldGroup}>
                <FieldLabel text="Full name" />
                <Field
                  value={name}
                  onChangeText={v => { setName(v); clearFieldError("name"); setSubmitError(""); }}
                  onBlur={() => validateField("name", sanitize(name))}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  autoCapitalize="words"
                  maxLength={100}
                  hasError={!!fieldErrors.name}
                  disabled={loading}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
                <FieldError msg={fieldErrors.name} />
              </View>

              <View style={s.fieldGroup}>
                <FieldLabel text="Email address" />
                <Field
                  inputRef={emailRef}
                  value={email}
                  onChangeText={v => { setEmail(v); clearFieldError("email"); setSubmitError(""); }}
                  onBlur={() => validateField("email", sanitize(email))}
                  placeholder="you@school.edu"
                  autoComplete="email"
                  keyboardType="email-address"
                  maxLength={254}
                  hasError={!!fieldErrors.email}
                  disabled={loading}
                  returnKeyType="next"
                  onSubmitEditing={() => pwRef.current?.focus()}
                />
                <FieldError msg={fieldErrors.email} />
              </View>

              <View style={s.fieldGroup}>
                <FieldLabel text="Password" />
                <Field
                  inputRef={pwRef}
                  value={password}
                  onChangeText={v => { setPassword(v); clearFieldError("password"); setSubmitError(""); }}
                  onBlur={() => validateField("password", sanitize(password))}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  secureTextEntry={!showPw}
                  maxLength={128}
                  hasError={!!fieldErrors.password}
                  disabled={loading}
                  returnKeyType="next"
                  onSubmitEditing={() => cpwRef.current?.focus()}
                  rightSlot={<EyeToggle show={showPw} onPress={() => setShowPw(v => !v)} />}
                />
                <FieldError msg={fieldErrors.password} />
                <PasswordStrength password={password} />
              </View>

              <View style={s.fieldGroup}>
                <FieldLabel text="Confirm password" />
                <Field
                  inputRef={cpwRef}
                  value={confirmPw}
                  onChangeText={v => { setConfirmPw(v); clearFieldError("confirmPw"); setSubmitError(""); }}
                  onBlur={() => validateField("confirmPw", sanitize(confirmPw))}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  secureTextEntry={!showCpw}
                  maxLength={128}
                  hasError={!!fieldErrors.confirmPw}
                  disabled={loading}
                  returnKeyType="done"
                  onSubmitEditing={sendOtp}
                  rightSlot={<EyeToggle show={showCpw} onPress={() => setShowCpw(v => !v)} />}
                />
                <FieldError msg={fieldErrors.confirmPw} />
              </View>

              <PrimaryButton
                label="Send verification code"
                loadingLabel="Sending code…"
                loading={loading}
                onPress={sendOtp}
              />
            </>
          )}

          {/* ── Step 2 ─────────────────────────────────────────── */}
          {step === "otp" && (
            <>
              <View style={s.fieldGroup}>
                <FieldLabel text="Verification code" />
                <Field
                  inputRef={otpRef}
                  value={otp}
                  onChangeText={v => {
                    const digits = v.replace(/\D/g, "").slice(0, 6);
                    setOtp(digits);
                    clearFieldError("otp");
                    setSubmitError("");
                  }}
                  placeholder="123456"
                  keyboardType="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  hasError={!!fieldErrors.otp}
                  disabled={loading}
                  textAlign="center"
                  returnKeyType="done"
                  onSubmitEditing={otp.length === 6 ? verifyOtp : undefined}
                />
                <FieldError msg={fieldErrors.otp?.trim() ? fieldErrors.otp : null} />
              </View>

              <PrimaryButton
                label="Verify & create account"
                loadingLabel="Verifying…"
                loading={loading}
                disabled={otp.length < 6}
                onPress={verifyOtp}
              />

              <View style={s.otpFooter}>
                <TouchableOpacity
                  onPress={() => { setStep("form"); setOtp(""); setSubmitError(""); }}
                  accessibilityRole="button"
                >
                  <Text style={s.backLink}>← Change email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={sendOtp}
                  disabled={cooldown > 0 || loading}
                  accessibilityRole="button"
                >
                  <Text style={[s.resendLink, (cooldown > 0 || loading) && s.resendDisabled]}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={s.switchRow}>
            <Text style={s.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateLogin} accessibilityRole="link">
              <Text style={s.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateSignup: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateSignup }: LoginProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]   = useState(false);

  const pwRef = useRef<TextInput>(null);

  const clearFieldError = (field: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: null }));

  const validateFieldBlur = (field: string, value: string) => {
    const validators: Record<string, (v: string) => string | null> = {
      email:    validateEmail,
      password: (v) => !v ? "Password is required." : null,
    };
    const err = validators[field]?.(value) ?? null;
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleLogin = useCallback(async () => {
    setSubmitError("");
    const ce = sanitize(email), cp = sanitize(password);
    const errs = {
      email:    validateEmail(ce),
      password: !cp ? "Password is required." : null,
    };
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      await api.login(ce, cp);
      onLoginSuccess();
    } catch (err: any) {
      setSubmitError(err.message ?? "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }, [email, password, onLoginSuccess]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.screen}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand mark */}
        <View style={s.logoWrap}>
          <View style={s.logoCircle}>
            <Text style={{ fontSize: 28 }}>🥗</Text>
          </View>
          <Text style={s.appName}>SmartFoodSave</Text>
        </View>

        <View style={s.card}>
          <Text style={s.heading}>Welcome back</Text>
          <Text style={s.subheading}>Sign in to your account</Text>

          <Banner msg={submitError} />

          <View style={s.fieldGroup}>
            <FieldLabel text="Email address" />
            <Field
              value={email}
              onChangeText={v => { setEmail(v); clearFieldError("email"); setSubmitError(""); }}
              onBlur={() => validateFieldBlur("email", sanitize(email))}
              placeholder="you@school.edu"
              autoComplete="email"
              keyboardType="email-address"
              maxLength={254}
              hasError={!!fieldErrors.email}
              disabled={loading}
              returnKeyType="next"
              onSubmitEditing={() => pwRef.current?.focus()}
            />
            <FieldError msg={fieldErrors.email} />
          </View>

          <View style={s.fieldGroup}>
            <FieldLabel text="Password" />
            <Field
              inputRef={pwRef}
              value={password}
              onChangeText={v => { setPassword(v); clearFieldError("password"); setSubmitError(""); }}
              onBlur={() => validateFieldBlur("password", sanitize(password))}
              placeholder="Your password"
              autoComplete="password"
              secureTextEntry={!showPw}
              maxLength={128}
              hasError={!!fieldErrors.password}
              disabled={loading}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              rightSlot={<EyeToggle show={showPw} onPress={() => setShowPw(v => !v)} />}
            />
            <FieldError msg={fieldErrors.password} />
          </View>

          <PrimaryButton
            label="Sign in"
            loadingLabel="Signing in…"
            loading={loading}
            onPress={handleLogin}
          />

          <View style={s.switchRow}>
            <Text style={s.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateSignup} accessibilityRole="link">
              <Text style={s.switchLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: C.emerald50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.emerald100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.emerald700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: C.gray900,
    textAlign: "center",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: C.gray500,
    textAlign: "center",
    marginBottom: 20,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.red50,
    borderWidth: 1,
    borderColor: C.red200,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  bannerIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: C.red600,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: C.gray700,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: C.white,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.gray900,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
  },
  inputDisabled: {
    backgroundColor: C.gray100,
  },
  inputRightSlot: {
    paddingRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldError: {
    marginTop: 4,
    fontSize: 12,
    color: C.red600,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.emerald600,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnDisabled: {
    backgroundColor: C.gray300,
  },
  btnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "600",
  },
  otpFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  backLink: {
    fontSize: 14,
    color: C.gray500,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: C.emerald600,
  },
  resendDisabled: {
    color: C.gray400,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  switchText: {
    fontSize: 13,
    color: C.gray500,
  },
  switchLink: {
    fontSize: 13,
    fontWeight: "700",
    color: C.emerald600,
  },
});