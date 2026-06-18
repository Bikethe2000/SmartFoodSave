import { useState, useCallback, useRef } from "react";
import { api } from "../api";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sanitize(str) {
  // Strip leading/trailing whitespace; disallow null bytes
  return str.trim().replace(/\0/g, "");
}

function validateEmail(email) {
  if (!email) return "Email is required.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  if (email.length > 254) return "Email address is too long.";
  return null;
}

function validatePassword(password) {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 128) return "Password is too long.";
  return null;
}

// ─── Rate-limit store (in-memory, per tab) ───────────────────────────────────
// A real app would use a server-side check; this is a client-side guard layer.
const loginAttempts = { count: 0, lockedUntil: 0 };

// ─── Component ────────────────────────────────────────────────────────────────
export default function Login() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [lockInfo, setLockInfo]   = useState(null); // { until: Date }

  const emailRef = useRef(null);

  // ── Per-field validation on blur ──────────────────────────────────────────
  const validateField = useCallback((name, value) => {
    let err = null;
    if (name === "email")    err = validateEmail(value);
    if (name === "password") err = validatePassword(value);
    setFieldErrors(prev => ({ ...prev, [name]: err }));
  }, []);

  const handleChange = useCallback((setter, name) => (e) => {
    const val = e.target.value;
    setter(val);
    // Clear field error as user types
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
  }, [fieldErrors]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Lockout check
    const now = Date.now();
    if (loginAttempts.lockedUntil > now) {
      const mins = Math.ceil((loginAttempts.lockedUntil - now) / 60000);
      setLockInfo({ until: loginAttempts.lockedUntil });
      setSubmitError(`Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`);
      return;
    }

    // Full validation before network call
    const cleanEmail    = sanitize(email);
    const cleanPassword = sanitize(password);
    const emailErr  = validateEmail(cleanEmail);
    const passErr   = validatePassword(cleanPassword);

    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      // Focus first error
      if (emailErr) emailRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await api.login(cleanEmail, cleanPassword);
      // Reset counter on success
      loginAttempts.count = 0;
      loginAttempts.lockedUntil = 0;
      window.location.href = "/dashboard";
    } catch (err) {
      loginAttempts.count += 1;

      if (loginAttempts.count >= MAX_ATTEMPTS) {
        loginAttempts.lockedUntil = Date.now() + LOCKOUT_MS;
        setLockInfo({ until: loginAttempts.lockedUntil });
        setSubmitError("Too many failed attempts. Your account is locked for 15 minutes.");
      } else {
        const remaining = MAX_ATTEMPTS - loginAttempts.count;
        // Deliberately vague — don't reveal which field is wrong
        setSubmitError(
          `Incorrect email or password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Lockout countdown display ─────────────────────────────────────────────
  const isLocked = lockInfo && lockInfo.until > Date.now();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo / heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
              <span className="text-2xl">🥗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to SmartFoodSave</p>
          </div>

          {/* Lockout / submit error */}
          {submitError && (
            <div
              role="alert"
              aria-live="assertive"
              className={`mb-5 p-3 rounded-lg text-sm flex items-start gap-2 ${
                isLocked
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-amber-50 border border-amber-200 text-amber-800"
              }`}
            >
              <span className="mt-0.5 flex-shrink-0">{isLocked ? "🔒" : "⚠️"}</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-5" autoComplete="on">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={handleChange(setEmail, "email")}
                onBlur={() => validateField("email", sanitize(email))}
                disabled={isLocked || loading}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                placeholder="you@school.edu"
                maxLength={254}
                className={`w-full px-4 py-3 rounded-lg border text-sm transition outline-none
                  ${fieldErrors.email
                    ? "border-red-400 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  }
                  disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {fieldErrors.email && (
                <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-emerald-600 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handleChange(setPassword, "password")}
                  onBlur={() => validateField("password", sanitize(password))}
                  disabled={isLocked || loading}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  placeholder="••••••••"
                  maxLength={128}
                  className={`w-full px-4 py-3 pr-11 rounded-lg border text-sm transition outline-none
                    ${fieldErrors.password
                      ? "border-red-400 focus:ring-2 focus:ring-red-300"
                      : "border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    }
                    disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                >
                  {showPw ? (
                    // eye-off
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                    </svg>
                  ) : (
                    // eye
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLocked || loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                disabled:bg-gray-300 disabled:cursor-not-allowed
                text-white font-semibold py-3 rounded-lg transition duration-150
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="text-emerald-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}