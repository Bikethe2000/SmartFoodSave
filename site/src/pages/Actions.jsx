import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Sparkles, 
  Check, 
  X, 
  Trash2, 
  Info,
  ShieldCheck
} from 'lucide-react';

export default function Actions() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecs();
  }, []);

  async function fetchRecs() {
    try {
      setLoading(true);
      const data = await api.getRecommendations();
      setRecs(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  }

  const handleAccept = async (id) => {
    try {
      await api.acceptRecommendation(id);
      // Refresh list to see updated status
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIgnore = async (id) => {
    try {
      await api.ignoreRecommendation(id);
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter recommendations: only show "pending" ones to the user
  const activeRecs = recs.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Recommended Actions</h1>
        <p className="text-sm text-slate-500">AI-generated adjustments to align food supply with predicted student attendance.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : activeRecs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Pending Actions</h3>
          <p className="text-sm text-slate-500">
            No recommendations yet. Once enough data is collected, SmartFoodSave will generate actionable suggestions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeRecs.map(rec => (
            <div key={rec.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Save {rec.impactKg} kg
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {(rec.confidence * 100).toFixed(0)}% AI confidence
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{rec.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{rec.description}</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suggested Change</span>
                  <p className="text-sm font-semibold text-emerald-800 mt-0.5">{rec.suggestedChange}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleIgnore(rec.id)}
                  className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <X className="h-4 w-4 text-slate-400" />
                  Ignore
                </button>
                <button 
                  onClick={() => handleAccept(rec.id)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
