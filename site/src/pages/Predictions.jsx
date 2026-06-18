import { useState } from "react";
import { auth } from "../firebase";

export default function Predictions() {
  const [form, setForm] = useState({
    date: "",
    menu_item: "",
    prepared_portions: "",
    attendance: "",
    // Comma-separated list, e.g. "chicken, vegetarian"
    preferred_foods: ""
  });


  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };
  const API_BASE = 'https://foodwasteai-production.up.railway.app/api';
  const handlePredict = async () => {
    setLoading(true);
    setResult(null);

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: form.date,
          menu_item: form.menu_item || null,
          prepared_portions: Number(form.prepared_portions),
          attendance: Number(form.attendance),
          preferred_foods: form.preferred_foods
            ? form.preferred_foods
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : null
        })

      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Prediction error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Food Waste Prediction</h1>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Menu Item <span className="text-slate-400">(optional if schedule set)</span>
          </label>
          <input
            type="text"
            name="menu_item"
            placeholder="Pasta"
            value={form.menu_item}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Preferred foods <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            name="preferred_foods"
            placeholder="e.g. chicken, vegetarian"
            value={form.preferred_foods}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
          />
        </div>


        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Prepared Portions</label>
            <input
              type="number"
              name="prepared_portions"
              value={form.prepared_portions}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Attendance</label>
            <input
              type="number"
              name="attendance"
              value={form.attendance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold"
      >
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result && (
        <div className="mt-4 p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-1 text-sm">
          <div><span className="font-bold">Menu item used:</span> {result.menuItemUsed}</div>
          <div><span className="font-bold">Predicted waste:</span> {result.predictedWastePortions} portions</div>
          <div><span className="font-bold">Risk level:</span> {result.riskLevel}</div>
          <div><span className="font-bold">Historical avg leftovers:</span> {result.historicalAvgLeftovers}</div>
          <div><span className="font-bold">Explanation:</span> {result.explanation}</div>
        </div>
      )}
    </div>
  );
}
