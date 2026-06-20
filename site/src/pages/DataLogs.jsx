import { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  History, 
  Info, 
  ClipboardList,
  Calendar
} from 'lucide-react';



export default function DataLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [date, setDate] = useState('');
  const [menuItems, setMenuItems] = useState('');
  const [attendance, setAttendance] = useState('');
  const [prepared, setPrepared] = useState('');
  const [served, setServed] = useState('');
  const [leftovers, setLeftovers] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await api.getDailyLogs();
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch daily logs.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-fill leftovers if prepared and served are entered
  useEffect(() => {
    const p = parseInt(prepared);
    const s = parseInt(served);
    if (!isNaN(p) && !isNaN(s)) {
      setLeftovers(Math.max(0, p - s).toString());
    }
  }, [prepared, served]);

  function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    const dayOfWeek = getDayOfWeek(date);
    if (!date || !menuItems || !prepared || !served || !leftovers) {
      setFormError('All fields are required.');
      return;
    }

    try {
      await api.addDailyLog({
        dayOfWeek,
        date,
        menuItems: menuItems.split(',').map(item => item.trim()),
        attendance: parseInt(attendance),
        prepared: parseInt(prepared),
        served: parseInt(served),
        leftovers: parseInt(leftovers),
      });

      // Reset form
      setDate('');
      setMenuItems('');
      setAttendance('');
      setPrepared('');
      setServed('');
      setLeftovers('');
      setFormSuccess(true);
      
      // Refresh list
      fetchLogs();
    } catch (err) {
      console.error(err);
      setFormError('Failed to submit log entry.');
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mt-18">Data Input & logs</h1>
        <p className="text-sm text-slate-500">Record prepared vs served portions to retrain the AI models.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-800">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold">Add Daily Log Entry</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700">
                Daily log recorded successfully!
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu Items (comma-separated)</label>
              <input 
                type="text"
                placeholder="e.g. Pasta, Green Salad"
                value={menuItems}
                onChange={(e) => setMenuItems(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700 placeholder:text-slate-300"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</label>
              <input 
                type="number"
                placeholder="e.g. 150"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700 placeholder:text-slate-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prepared Portions</label>
                <input 
                  type="number"
                  placeholder="150"
                  value={prepared}
                  onChange={(e) => setPrepared(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700 placeholder:text-slate-300"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Served Portions</label>
                <input 
                  type="number"
                  placeholder="130"
                  value={served}
                  onChange={(e) => setServed(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700 placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leftover Portions</label>
              <input 
                type="number"
                placeholder="20"
                value={leftovers}
                onChange={(e) => setLeftovers(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700 placeholder:text-slate-300"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Save Daily Log
            </button>
          </form>

          {/* Info Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-2.5">
            <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              “Synthetic or sample data can be used during testing. In real deployment, this connects to cafeteria records.”
            </p>
          </div>
        </div>

        {/* Logs Table Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <History className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold">Daily History Logs</h2>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-2xl flex-grow">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No logs submitted yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Menu Item(s)</th>
                      <th className="p-4 text-center">Prepared</th>
                      <th className="p-4 text-center">Served</th>
                      <th className="p-4 text-center">Leftovers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {logs.map(log => (
                      
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {log.dayOfWeek ? `${log.dayOfWeek} — ${log.date}` : log.date}
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {log.menuItems.join(', ')}
                        </td>
                        <td className="p-4 text-center text-slate-700 font-medium">{log.prepared}</td>
                        <td className="p-4 text-center text-slate-700 font-medium">{log.served}</td>
                        <td className="p-4 text-center font-bold text-emerald-600">{log.leftovers}</td>
                        <td className="p-4 text-center text-slate-400 text-xs font-semibold">{(((log.prepared - log.served) / log.prepared) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
