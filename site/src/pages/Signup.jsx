import { useState, useCallback, useRef } from "react";
import { api } from "../api";

// ─── Constants ────────────────────────────────────────────────────────────────
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_RE     = /^\d{6}$/;
const API_BASE   = import.meta.env.VITE_API_URL || "https://foodwasteai-production.up.railway.app";

// ─── Password strength ────────────────────────────────────────────────────────
function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
}

const STRENGTH_LABELS = ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"];
const STRENGTH_COLORS = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-600"];

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = calcStrength(password);
  return (
    <div className="mt-2 space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? STRENGTH_COLORS[score] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        score <= 2 ? "text-red-500" : score === 3 ? "text-yellow-600" : "text-emerald-600"
      }`}>
        {STRENGTH_LABELS[score]}
        {score < 3 && " — add uppercase, numbers, or symbols"}
      </p>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sanitize(str) {
  return str.trim().replace(/\0/g, "");
}

function validateName(name) {
  if (!name) return "Full name is required.";
  if (name.length < 2) return "Name must be at least 2 characters.";
  if (name.length > 100) return "Name is too long.";
  // Basic: disallow angle brackets to prevent injection in email templates
  if (/[<>]/.test(name)) return "Name contains invalid characters.";
  return null;
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
  if (calcStrength(password) < 2) return "Password is too weak. Add uppercase letters or numbers.";
  return null;
}

function validateOtp(otp) {
  if (!otp) return "Verification code is required.";
  if (!OTP_RE.test(otp)) return "Code must be exactly 6 digits.";
  return null;
}

// OTP resend rate-limit (client-side guard)
const otpState = { lastSent: 0 };
const OTP_COOLDOWN_MS = 60_000; // 1 minute

// ─── Component ────────────────────────────────────────────────────────────────
export default function Signup() {
  const [step, setStep]           = useState("form"); // "form" | "otp"
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [otp, setOtp]             = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining

  const nameRef = useRef(null);
  const otpRef  = useRef(null);

  // ── Per-field validation on blur ──────────────────────────────────────────
  const validateField = useCallback((name_, value) => {
    const validators = {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPw: (v) => v !== password ? "Passwords do not match." : null,
    };
    const err = validators[name_]?.(value) ?? null;
    setFieldErrors(prev => ({ ...prev, [name_]: err }));
  }, [password]);

  const handleChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (fieldErrors[fieldName]) setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
    setSubmitError("");
  };

  // ── Resend cooldown ticker ────────────────────────────────────────────────
  const startCooldown = () => {
    otpState.lastSent = Date.now();
    let secs = Math.ceil(OTP_COOLDOWN_MS / 1000);
    setResendCooldown(secs);
    const iv = setInterval(() => {
      secs--;
      setResendCooldown(secs);
      if (secs <= 0) clearInterval(iv);
    }, 1000);
  };

  // ── Step 1: send OTP ─────────────────────────────────────────────────────
  const sendOtp = async (e) => {
    e?.preventDefault();
    setSubmitError("");

    const cleanName  = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanPw    = sanitize(password);
    const cleanCpw   = sanitize(confirmPw);

    const errs = {
      name:      validateName(cleanName),
      email:     validateEmail(cleanEmail),
      password:  validatePassword(cleanPw),
      confirmPw: cleanCpw !== cleanPw ? "Passwords do not match." : null,
    };
    setFieldErrors(errs);

    if (Object.values(errs).some(Boolean)) {
      if (errs.name) nameRef.current?.focus();
      return;
    }

    // Client-side resend guard
    const elapsed = Date.now() - otpState.lastSent;
    if (elapsed < OTP_COOLDOWN_MS) {
      setSubmitError(`Please wait ${Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000)}s before requesting another code.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, email: cleanEmail }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to send verification code.");
      }

      startCooldown();
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch (err) {
      setSubmitError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP & create account ──────────────────────────────────
  const verifyOtp = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const cleanOtp = sanitize(otp);
    const otpErr   = validateOtp(cleanOtp);
    if (otpErr) {
      setFieldErrors(prev => ({ ...prev, otp: otpErr }));
      return;
    }

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
        // Don't reveal whether it's an expired vs wrong code
        throw new Error(body.detail || "Invalid or expired verification code.");
      }

      await api.login(sanitize(email), sanitize(password));

      try {
        const settings = await api.getSettings();
        if (!settings?.schoolName) {
          window.location.href = "/settings";
          return;
        }
      } catch {
        // ignore — continue to dashboard
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setSubmitError(err.message || "Verification failed. Please try again.");
      setFieldErrors(prev => ({ ...prev, otp: " " })); // mark field red
    } finally {
      setLoading(false);
    }
  };

  // ── Shared eye-toggle icon ────────────────────────────────────────────────
  const EyeIcon = ({ show }) =>
    show ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  const fieldClass = (errKey) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition outline-none
     ${fieldErrors[errKey]
       ? "border-red-400 focus:ring-2 focus:ring-red-300"
       : "border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
     }
     disabled:bg-gray-100 disabled:cursor-not-allowed`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
              <span className="text-2xl">🥗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === "form" ? "Create your account" : "Check your email"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === "form"
                ? "Join SmartFoodSave today"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Error banner */}
          {submitError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-5 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-start gap-2"
            >
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* ── Step 1: Registration form ─────────────────────────────── */}
          {step === "form" && (
            <form onSubmit={sendOtp} noValidate className="space-y-5" autoComplete="on">

              {/* Name */}
              <div>
                <label htmlFor="su-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  ref={nameRef}
                  id="su-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={handleChange(setName, "name")}
                  onBlur={() => validateField("name", sanitize(name))}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  placeholder="Jane Smith"
                  maxLength={100}
                  className={fieldClass("name")}
                />
                {fieldErrors.name && (
                  <p id="name-error" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="su-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="su-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={handleChange(setEmail, "email")}
                  onBlur={() => validateField("email", sanitize(email))}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "su-email-error" : undefined}
                  placeholder="you@school.edu"
                  maxLength={254}
                  className={fieldClass("email")}
                />
                {fieldErrors.email && (
                  <p id="su-email-error" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="su-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="su-password"
                    type={showPw ? "text" : "password"}
                    name="new-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={handleChange(setPassword, "password")}
                    onBlur={() => validateField("password", sanitize(password))}
                    disabled={loading}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby="su-pw-desc"
                    placeholder="Min. 8 characters"
                    maxLength={128}
                    className={`${fieldClass("password")} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                  >
                    <EyeIcon show={showPw} />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="su-pw-desc" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="su-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="su-confirm"
                    type={showConfirm ? "text" : "password"}
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirmPw}
                    onChange={handleChange(setConfirmPw, "confirmPw")}
                    onBlur={() => validateField("confirmPw", sanitize(confirmPw))}
                    disabled={loading}
                    aria-invalid={!!fieldErrors.confirmPw}
                    aria-describedby={fieldErrors.confirmPw ? "confirm-error" : undefined}
                    placeholder="Repeat password"
                    maxLength={128}
                    className={`${fieldClass("confirmPw")} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                  >
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
                {fieldErrors.confirmPw && (
                  <p id="confirm-error" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.confirmPw}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
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
                    Sending code…
                  </>
                ) : "Send verification code"}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP form ──────────────────────────────────────── */}
          {step === "otp" && (
            <form onSubmit={verifyOtp} noValidate className="space-y-5">

              {/* OTP input */}
              <div>
                <label htmlFor="su-otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification code
                </label>
                <input
                  ref={otpRef}
                  id="su-otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => {
                    // Only allow digits, max 6
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(val);
                    if (fieldErrors.otp) setFieldErrors(prev => ({ ...prev, otp: null }));
                    setSubmitError("");
                  }}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.otp}
                  aria-describedby={fieldErrors.otp ? "otp-error" : undefined}
                  placeholder="123456"
                  maxLength={6}
                  className={`${fieldClass("otp")} text-center text-xl tracking-[0.5em] font-mono`}
                />
                {fieldErrors.otp && fieldErrors.otp.trim() && (
                  <p id="otp-error" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.otp}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
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
                    Verifying…
                  </>
                ) : "Verify & create account"}
              </button>

              {/* Resend + back */}
              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => { setStep("form"); setOtp(""); setSubmitError(""); }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-emerald-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-emerald-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}