import { useState } from "react";
import { api } from "../api";

export default function Signup() {
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });

      setStep("otp");
    } catch  {
      setError("Failed to send verification code");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp })
      });

      if (!res.ok) throw new Error();

      // login user automatically
      await api.login(email, password);

      // Check settings - if no school configured, send user to settings to submit school
      try {
        const settings = await api.getSettings();
        if (!settings || !settings.schoolName) {
          window.location.href = "/settings";
          return;
        }
      } catch  {
        // ignore and continue to dashboard
      }

      window.location.href = "/dashboard";

    } catch  {
      setError("Invalid verification code");
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>
      )}

      {step === "form" && (
        <form onSubmit={sendOtp} className="space-y-4">
          <input
            className="w-full p-3 border rounded"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full p-3 border rounded"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full p-3 border rounded"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-emerald-600 text-white p-3 rounded font-bold">
            Send Verification Code
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <p className="text-slate-600 text-center">
            We sent a 6‑digit code to <strong>{email}</strong>
          </p>

          <input
            className="w-full p-3 border rounded"
            placeholder="Enter verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button className="w-full bg-emerald-600 text-white p-3 rounded font-bold">
            Verify & Create Account
          </button>
        </form>
      )}
    </div>
  );
}
