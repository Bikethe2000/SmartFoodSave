import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Trash2, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const [weeklyWaste, setWeeklyWaste] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [quickRecs, setQuickRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [wasteData, alertData, recData] = await Promise.all([
          api.getWeeklyWaste(),
          api.getUpcomingPredictions(),
          api.getTodayRecommendations()
        ]);
        setWeeklyWaste(wasteData);
        setAlerts(alertData);
        setQuickRecs(recData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalWasteThisWeek = weeklyWaste.reduce((sum, item) => sum + item.waste, 0).toFixed(1);
  // Simple calculated metrics based on loaded data
  const highRiskCount = alerts.filter(a => a.riskLevel === 'High').length;
  const mostWastedItem = "Pasta Carbonara"; // Static derived or mock

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto my-12">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/50 backdrop-blur-md rounded-full border border-emerald-500/30 text-emerald-200 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            AI-Powered Waste Prevention
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">SmartFoodSave</h1>
          <p className="text-emerald-100 text-lg">
            Welcome to SmartFoodSave. Make your school’s food waste visible, predictable, and manageable.
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Estimated Waste This Week</p>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">{totalWasteThisWeek} kg</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-emerald-600">
              <TrendingDown className="h-4 w-4" />
              -12.4% vs last week
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Change vs Last Week</p>
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">-12.4%</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-slate-500">
              Down from 44.8 kg
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">High-Risk Days</p>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">{highRiskCount}</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-amber-600">
              Requires menu adjustment
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Most Wasted Item</p>
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-800 truncate">{mostWastedItem}</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-red-600">
              Avg 12.5 kg leftover
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Predictions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Weekly Waste Trend</h2>
              <p className="text-sm text-slate-500">Real-time daily food leftovers (kg)</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyWaste} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="waste" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorWaste)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Column */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Upcoming Risk Alerts</h2>
              <p className="text-sm text-slate-500">High risk days flagged by AI</p>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[280px] pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm">No high-risk days flagged</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {alert.date}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        alert.riskLevel === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {alert.riskLevel} Risk
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-700 text-sm">{alert.menuItems.join(', ')}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{alert.explanation}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('predictions')}
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition"
          >
            View Predictions Table
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Recommendations Footer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Quick Recommendations</h2>
            <p className="text-sm text-slate-500">Top efficiency actions for today</p>
          </div>
          <button 
            onClick={() => setActiveTab('actions')}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 transition"
          >
            All Actions
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickRecs.length === 0 ? (
            <div className="md:col-span-3 text-center py-8 text-slate-400">
              <CheckCircle className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm">All recommendations reviewed!</p>
            </div>
          ) : (
            quickRecs.map(rec => (
              <div key={rec.id} className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm">{rec.title}</h4>
                  <p className="text-xs text-slate-500">{rec.description}</p>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-700">Save {rec.impactKg} kg</span>
                  <span className="text-slate-400">{(rec.confidence * 100).toFixed(0)}% confidence</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
