import { useState } from "react";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.login(email, password);
      window.location.href = "/dashboard";
    } catch  {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
          Sign In
        </button>
      </form>
      <p className="text-center mt-4">
        Don't have an account?{" "}
        <a href="/signup" className="text-emerald-600 font-bold">
          Sign Up
        </a>
      </p>
    </div>
  );
}