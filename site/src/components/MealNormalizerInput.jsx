import { useState } from "react";
import { auth } from "../firebase";

export default function MealNormalizerInput({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const handleBlur = async () => {
    if (!value || value.trim().length < 3) return;

    const token = await getToken();
    if (!token) return;

    const res = await fetch("/api/meals/normalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ input: value }),
    });

    const data = await res.json();
    setSuggestions(data.suggestions || []);
  };

  return (
    <div className="space-y-1">
      <input
        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="Type meal (e.g. pasta, chicken, fish...)"
      />

      {suggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setSuggestions([]);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
