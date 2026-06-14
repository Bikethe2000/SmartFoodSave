import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Calendar, 
  HelpCircle, 
  ChevronRight, 
  X, 
  AlertCircle,
  Search,
  Filter,
  Info
} from 'lucide-react';

export default function Predictions({ showConfidenceRanges }) {
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [fromDate, setFromDate] = useState('2026-06-15');
  const [toDate, setToDate] = useState('2026-06-19');
  const [viewMode, setViewMode] = useState('day'); // day or item

  useEffect(() => {
    async function fetchPredictions() {
      try {
        setLoading(true);
        const data = await api.getPredictions(fromDate, toDate);
        setPredictions(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch predictions.');
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, [fromDate, toDate]);

  const handleRowClick = async (id) => {
    try {
      const details = await api.getPredictionDetails(id);
      setSelectedPrediction(details);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Waste Predictions</h1>
        <p className="text-sm text-slate-500">AI-predicted food leftovers based on attendance, weather, and menu history.</p>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">From:</span>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-emerald-500" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">To:</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-emerald-500" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Group by:
          </span>
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-emerald-500"
          >
            <option value="day">View by Day</option>
            <option value="item">View by Menu Item</option>
          </select>
        </div>
      </div>

      {/* Main predictions area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : predictions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No predictions available for the selected range.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Menu Items</th>
                    <th className="p-4">Predicted Waste</th>
                    <th className="p-4">Risk Level</th>
                    <th className="p-4 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {predictions.map(pred => (
                    <tr 
                      key={pred.id} 
                      onClick={() => handleRowClick(pred.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition ${
                        selectedPrediction?.id === pred.id ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="p-4 font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {pred.date}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {pred.menuItems.join(', ')}
                      </td>
                      <td className="p-4 text-slate-800 font-bold">
                        {pred.predictedWasteKg} kg
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          pred.riskLevel === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                          pred.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {pred.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-600">
                        {(pred.confidence * 100).toFixed(0)}%
                        {showConfidenceRanges && (
                          <div className="text-[10px] text-slate-400">
                            ±{((1 - pred.confidence) * 10).toFixed(1)}% range
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side Panel / Detail Panel */}
        <div className="space-y-6">
          {selectedPrediction ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md space-y-4 animate-fade-in relative">
              <button 
                onClick={() => setSelectedPrediction(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">AI Forecast Breakdown</span>
                <h3 className="text-lg font-bold text-slate-800">{selectedPrediction.date}</h3>
              </div>

              <div className="border-t border-b border-slate-100 py-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400">Menu items:</span>
                  <p className="text-sm font-semibold text-slate-700">{selectedPrediction.menuItems.join(', ')}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Estimated Leftovers:</span>
                  <p className="text-sm font-bold text-emerald-600">{selectedPrediction.predictedWasteKg} kg</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Why this prediction?</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100/50 leading-relaxed">
                  {selectedPrediction.explanation}
                </p>
              </div>

              {showConfidenceRanges && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <h5 className="text-xs font-bold text-blue-700">Confidence Range Details</h5>
                  <p className="text-xs text-blue-600 mt-1">
                    Based on confidence of {(selectedPrediction.confidence * 100).toFixed(0)}%, estimated waste is expected to fall between {(selectedPrediction.predictedWasteKg * 0.9).toFixed(1)} kg and {(selectedPrediction.predictedWasteKg * 1.1).toFixed(1)} kg.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <HelpCircle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Select a prediction row to view detailed AI insights & factors.</p>
            </div>
          )}

          {/* Responsible AI Notice */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex gap-3">
            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Responsible AI Notice</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                “These predictions are estimates based on historical patterns. Staff should always make the final decision.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
