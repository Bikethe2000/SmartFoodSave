import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { auth } from "../firebase";

const TIMEZONES = [
  { value: 'GMT-12', label: 'GMT-12 — Baker Island, Howland Island' },
  { value: 'GMT-11', label: 'GMT-11 — American Samoa, Niue' },
  { value: 'GMT-10', label: 'GMT-10 — Hawaii, Cook Islands' },
  { value: 'GMT-9:30', label: 'GMT-9:30 — Marquesas Islands' },
  { value: 'GMT-9', label: 'GMT-9 — Alaska' },
  { value: 'GMT-8', label: 'GMT-8 — PST — Los Angeles, Vancouver' },
  { value: 'GMT-7', label: 'GMT-7 — MST — Denver, Phoenix' },
  { value: 'GMT-6', label: 'GMT-6 — CST — Chicago, Mexico City' },
  { value: 'GMT-5', label: 'GMT-5 — EST — New York, Toronto, Bogotá' },
  { value: 'GMT-4', label: 'GMT-4 — AST — Halifax, Caracas, Santiago' },
  { value: 'GMT-3:30', label: 'GMT-3:30 — Newfoundland' },
  { value: 'GMT-3', label: 'GMT-3 — BRT — São Paulo, Buenos Aires, Montevideo' },
  { value: 'GMT-2', label: 'GMT-2 — South Georgia Island' },
  { value: 'GMT-1', label: 'GMT-1 — Azores, Cape Verde' },
  { value: 'GMT+0', label: 'GMT+0 — WET — London, Dublin, Lisbon, Accra' },
  { value: 'GMT+1', label: 'GMT+1 — CET — Paris, Berlin, Rome, Madrid, Lagos' },
  { value: 'GMT+2', label: 'GMT+2 — EET — Athens, Cairo, Kyiv, Johannesburg' },
  { value: 'GMT+3', label: 'GMT+3 — MSK — Moscow, Istanbul, Nairobi, Riyadh' },
  { value: 'GMT+3:30', label: 'GMT+3:30 — Iran Standard Time — Tehran' },
  { value: 'GMT+4', label: 'GMT+4 — GST — Dubai, Baku, Tbilisi' },
  { value: 'GMT+4:30', label: 'GMT+4:30 — Afghanistan — Kabul' },
  { value: 'GMT+5', label: 'GMT+5 — PKT — Karachi, Tashkent, Yekaterinburg' },
  { value: 'GMT+5:30', label: 'GMT+5:30 — IST — Mumbai, Delhi, Kolkata' },
  { value: 'GMT+5:45', label: 'GMT+5:45 — NPT — Kathmandu' },
  { value: 'GMT+6', label: 'GMT+6 — BST — Dhaka, Almaty, Omsk' },
  { value: 'GMT+6:30', label: 'GMT+6:30 — MMT — Yangon (Myanmar)' },
  { value: 'GMT+7', label: 'GMT+7 — ICT — Bangkok, Jakarta, Ho Chi Minh' },
  { value: 'GMT+8', label: 'GMT+8 — CST — Beijing, Singapore, Kuala Lumpur, Perth' },
  { value: 'GMT+8:45', label: 'GMT+8:45 — ACWST — Eucla (Australia)' },
  { value: 'GMT+9', label: 'GMT+9 — JST — Tokyo, Seoul, Yakutsk' },
  { value: 'GMT+9:30', label: 'GMT+9:30 — ACST — Adelaide, Darwin' },
  { value: 'GMT+10', label: 'GMT+10 — AEST — Sydney, Melbourne, Brisbane' },
  { value: 'GMT+10:30', label: 'GMT+10:30 — Lord Howe Island' },
  { value: 'GMT+11', label: 'GMT+11 — AEDT — Solomon Islands, Magadan' },
  { value: 'GMT+12', label: 'GMT+12 — NZST — Auckland, Fiji, Kamchatka' },
  { value: 'GMT+12:45', label: 'GMT+12:45 — CHAST — Chatham Islands' },
  { value: 'GMT+13', label: 'GMT+13 — TOT — Tonga, Samoa' },
  { value: 'GMT+14', label: 'GMT+14 — LINT — Line Islands (Kiribati)' },
];

export default function Settings({ showConfidenceRanges, setShowConfidenceRanges }) {
  const [schoolName, setSchoolName] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState('GMT+2');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const API_BASE = 'https://foodwasteai-production.up.railway.app/api';

  useEffect(() => {
    async function loadSettings() {
      try {
        const token = await getToken();
        if (!token) { console.warn("No auth token available"); return; }

        const res = await fetch(`${API_BASE}/settings`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) { console.error("Failed to load settings", await res.text()); return; }

        const data = await res.json();
        setSchoolName(data.schoolName || "");
        setStudentCount(data.studentCount || "");
        setPortionSize(data.portionSize || "");
        setCity(data.location || "");
        setTimezone(data.timezone || "GMT+2");
        setShowConfidenceRanges(data.showConfidenceRanges || false);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
      setLoading(false);
    }
    loadSettings();
  }, [setShowConfidenceRanges]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) { console.warn("No auth token available"); return; }

      await fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ schoolName, studentCount, portionSize, location: city, timezone, showConfidenceRanges })
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto text-center py-10 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configuration Settings</h1>
        <p className="text-sm text-slate-500">Manage school profiles and AI visualization parameters.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-slate-800">
          <SettingsIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold">Cafeteria Profile</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {saved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="h-4 w-4" />
              Settings saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Athens, New York"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Typical Number of Students</label>
              <input
                type="number"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Portion Size</label>
              <input
                type="text"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700 bg-white"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Settings Toggles */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visualization Parameters</h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-slate-700">Show confidence ranges</h4>
                <p className="text-xs text-slate-400 mt-0.5">Display lower/upper margin limits for waste predictions.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfidenceRanges(!showConfidenceRanges)}
                className="text-emerald-600 focus:outline-none"
              >
                {showConfidenceRanges
                  ? <ToggleRight className="h-10 w-10" />
                  : <ToggleLeft className="h-10 w-10 text-slate-300" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}