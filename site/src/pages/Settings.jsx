import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { auth } from "../firebase";

export default function Settings({ showConfidenceRanges, setShowConfidenceRanges }) {
  const [schoolName, setSchoolName] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState('GMT+3');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  // -----------------------------
  // LOAD SETTINGS FROM BACKEND
  // -----------------------------
  useEffect(() => {
    async function loadSettings() {
      try {
        const token = await getToken();
        if (!token) {
          console.warn("No auth token available");
          return;
        }

        const res = await fetch("/api/settings", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          console.error("Failed to load settings", await res.text());
          return;
        }

        const data = await res.json();

        setSchoolName(data.schoolName || "");
        setStudentCount(data.studentCount || "");
        setPortionSize(data.portionSize || "");
        setCity(data.location || "");
        setTimezone(data.timezone || "GMT+3");
        setShowConfidenceRanges(data.showConfidenceRanges || false);

      } catch (err) {
        console.error("Failed to load settings:", err);
      }

      setLoading(false);
    }

    loadSettings();
  }, [setShowConfidenceRanges]);

  // -----------------------------
  // SAVE SETTINGS TO BACKEND
  // -----------------------------
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();
      if (!token) {
        console.warn("No auth token available");
        return;
      }

      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          schoolName,
          studentCount,
          portionSize,
          location: city,
          timezone,
          showConfidenceRanges
        })
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 text-slate-500">
        Loading settings...
      </div>
    );
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timezone</label>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700"
              >
                <option value="GMT-5">GMT-5 (EST)</option>
                <option value="GMT+0">GMT+0 (WET)</option>
                <option value="GMT+1">GMT+1 (CET)</option>
                <option value="GMT+2">GMT+2 (EET)</option>
                <option value="GMT+3">GMT+3 (MSK)</option>
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
                {showConfidenceRanges ? (
                  <ToggleRight className="h-10 w-10" />
                ) : (
                  <ToggleLeft className="h-10 w-10 text-slate-300" />
                )}
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
