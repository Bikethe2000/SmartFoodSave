import { useEffect, useState } from "react";
import { auth } from "../firebase";
import NearbyDonations from "../components/NearbyDonations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  CalendarDays,
  Lightbulb,
} from "lucide-react";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [mealStats, setMealStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [weeklyPrediction, setWeeklyPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [defaultSchedule, setDefaultSchedule] = useState({});


  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };
  const API_BASE = 'https://foodwasteai-production.up.railway.app/api';
  // LOAD LOGS
  useEffect(() => {
    async function loadLogs() {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(`${API_BASE}/data/daily-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setLogs(data);

        const stats = {};
        data.forEach((log) => {
          log.menuItems.forEach((item) => {
            if (!stats[item]) stats[item] = { count: 0, waste: 0 };
            stats[item].count += 1;
            stats[item].waste += log.leftovers;
          });
        });

        setMealStats(stats);
      } catch (err) {
        console.error("Failed to load logs:", err);
      }

      setLoading(false);
    }

    loadLogs();
  }, []);

  // LOAD SCHEDULE + AUTO‑CREATE DEFAULT IF MISSING
  useEffect(() => {
    async function loadSchedule() {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      let schedule = data.schedule;

      if (!schedule || Object.keys(schedule).length === 0) {
        

        await fetch(`${API_BASE}/schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ schedule }),
        });
      }

      const normalized = {};
      Object.keys(schedule).forEach((day) => {
        normalized[day.charAt(0).toUpperCase() + day.slice(1)] = schedule[day];
      });

      setDefaultSchedule(normalized);
    }

    loadSchedule();
  }, []);
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-10 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  const totalPrepared = logs.reduce((a, b) => a + (b.prepared || 0), 0);
  const totalLeftovers = logs.reduce((a, b) => a + (b.leftovers || 0), 0);
  const totalAttendance = logs.reduce((a, b) => a + (b.attendance || 0), 0);

  const wastePercent =
    totalPrepared > 0 ? ((totalLeftovers / totalPrepared) * 100).toFixed(1) : 0;

  const insight =
    wastePercent > 25
      ? "Waste levels are high. Consider adjusting portions or reviewing menu items."
      : wastePercent > 10
      ? "Moderate waste. Some improvements could help reduce leftovers."
      : "Great job! Waste levels are low and stable.";

  const mealPerformance = Object.entries(mealStats).map(([meal, stats]) => ({
    meal,
    avgWaste: stats.waste / stats.count,
  }));

  const predictNextWeek = async () => {
    const token = await getToken();
    if (!token) return;

    setPredicting(true);
    const results = {};
    const suggestedSoFar = [];

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const dates = getNextWeekdays();

    for (let i = 0; i < 5; i++) {
      const day = weekdays[i];
      const date = dates[i];

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: date,
          menu_item: defaultSchedule[day] || null,
          prepared_portions: 120,
          attendance: 100,
          preferred_foods: null,
          excluded_meals: suggestedSoFar
        }),
      });

      const data = await res.json();
      results[day] = data;

      if (data.menuItemUsed) {
        suggestedSoFar.push(data.menuItemUsed);
      }
    }

    setWeeklyPrediction(results);
    setPredicting(false);
  };

  function getNextWeekdays() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + daysUntilNextMonday + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }

  const getTrendColor = () => {
    if (wastePercent < 10) return "text-emerald-600";
    if (wastePercent < 20) return "text-yellow-600";
    return "text-red-600";
  };
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in mb-10">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <NearbyDonations />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Attendance"
          value={totalAttendance}
          icon={<CalendarDays className="h-5 w-5 text-emerald-600" />}
        />
        <SummaryCard
          title="Prepared"
          value={totalPrepared}
          icon={<PieChart className="h-5 w-5 text-indigo-600" />}
        />
        <SummaryCard
          title="Leftovers"
          value={totalLeftovers}
          icon={<TrendingDown className="h-5 w-5 text-red-600" />}
        />
        <SummaryCard
          title="Waste %"
          value={`${wastePercent}%`}
          icon={<TrendingUp className="h-5 w-5 text-yellow-600" />}
          color={getTrendColor()}
        />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-700 mb-4">
          Waste Trend (Last 14 Days)
        </h2>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="leftovers"
              stroke="#10b981"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-700 mb-4">
          Meal Performance (Avg Waste)
        </h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={mealPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="meal" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="avgWaste" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-emerald-800 text-sm font-semibold">
        {insight}
      </div>

      <button
        onClick={predictNextWeek}
        disabled={predicting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition"
      >
        <Lightbulb className="h-4 w-4" />
        {predicting ? "Predicting..." : "Predict Next Week"}
      </button>

      {weeklyPrediction && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-700">Weekly Schedule Comparison</h2>

          {Object.entries(weeklyPrediction).map(([day, result]) => (
            <div key={day} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-800 mb-2">{day}</div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Default Meal</div>
                  <div className="font-semibold">{defaultSchedule[day] || "—"}</div>
                </div>

                <div>
                  <div className="text-slate-500">Suggested Meal</div>
                  <div className="font-semibold text-indigo-600">
                    {result.menuItemUsed}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Waste: <strong>{result.predictedWastePortions}</strong> portions  
                <br />
                Risk: <strong>{result.riskLevel}</strong>
                <br />
                <span className="text-slate-500">{result.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase">
        {icon}
        {title}
      </div>
      <div className={`text-xl font-bold ${color || "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}
