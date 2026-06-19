import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Icons (Apple-style minimal)
const ICONS = {
  pasta: "🍝",
  soup: "🥣",
  chicken: "🍗",
  fish: "🐟",
  beef: "🥩",
  pizza: "🍕",
  vegetarian: "🥦",
  legumes: "🫘",
  "rice dishes": "🍚",
  "salad meals": "🥗",
};

const COLORS = {
  pasta: "#f5e0c3",
  soup: "#ffe9c7",
  chicken: "#ffe2d2",
  fish: "#d7f0ff",
  beef: "#ffd4d4",
  pizza: "#ffe0b3",
  vegetarian: "#d9f7d9",
  legumes: "#f3e5d8",
  "rice dishes": "#f7f7d1",
  "salad meals": "#d9f7e8",
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const CATEGORIES = Object.keys(ICONS);

export default function WeeklyPlanEditor({ school }) {
  const [plan, setPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      const ref = doc(db, "school_schedules", school);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setPlan(data.weekly_plan || {});
      } else {
        setPlan({});
      }

      setLoading(false);
    }

    loadPlan();
  }, [school]);

  const updateDay = (day, value) => {
    setPlan((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  // In savePlan(), change updateDoc to setDoc:
  const savePlan = async () => {
    setSaving(true);
    const ref = doc(db, "school_schedules", school);
    await setDoc(ref, { weekly_plan: plan }, { merge: true }); // ← was updateDoc
    setSaving(false);
  };

  if (loading)
    return (
      <p style={{ padding: 20, opacity: 0.7, animation: "fadeIn 0.5s" }}>
        Loading weekly plan...
      </p>
    );

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 650,
        margin: "0 auto",
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        animation: "fadeIn 0.6s ease-out",
        darkMode: {
          background: "#000000",
          color: "#ddd",
        },
      }}
    >
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>

      <h2
        style={{
          textAlign: "center",
          marginBottom: 25,
          fontSize: 28,
          fontWeight: 600,
          color: "#222",
        }}
      >
        Weekly Meal Plan
      </h2>

      {/* Weekly plan preview card */}
      <div
        style={{
          background: "#f9f9f9",
          padding: 20,
          borderRadius: 16,
          marginBottom: 25,
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          animation: "slideUp 0.5s ease-out",
        }}
      >
        <h3 style={{ marginBottom: 15, fontSize: 20, color: "#444" }}>
          Preview
        </h3>

        {DAYS.map((day) => (
          <div
            key={day}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
              gap: 10,
            }}
          >
            <strong style={{ width: 100, textTransform: "capitalize" }}>
              {day}:
            </strong>

            {plan[day] ? (
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 12,
                  background: COLORS[plan[day]],
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{ICONS[plan[day]]}</span>
                <span style={{ fontWeight: 500 }}>{plan[day]}</span>
              </div>
            ) : (
              <span style={{ opacity: 0.5 }}>No selection</span>
            )}
          </div>
        ))}
      </div>

      {/* Dropdowns */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {DAYS.map((day) => (
          <div
            key={day}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              animation: "slideUp 0.4s ease-out",
            }}
          >
            <label
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#444",
                textTransform: "capitalize",
              }}
            >
              {day}
            </label>

            <select
              value={plan[day] || ""}
              onChange={(e) => updateDay(day, e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                fontSize: 15,
                background: "#fafafa",
                transition: "0.2s",
              }}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {ICONS[cat]} {cat}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={savePlan}
        disabled={saving}
        style={{
          marginTop: 30,
          width: "100%",
          padding: "14px 0",
          background: saving ? "#7bcf7b" : "#4CAF50",
          color: "white",
          fontSize: 17,
          fontWeight: 600,
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        {saving ? "Saving..." : "Save Weekly Plan"}
      </button>
    </div>
  );
}
