import { useState } from 'react';
import { api } from '../api';

export default function SchoolBanner({ initialSettings = {}, onSaved }) {
  const [schoolName, setSchoolName] = useState(initialSettings.schoolName || '');
  const [schoolType, setSchoolType] = useState(initialSettings.schoolType || 'Primary');
  const [studentCount, setStudentCount] = useState(initialSettings.studentCount || '');
  const [portionSize, setPortionSize] = useState(initialSettings.portionSize || '');
  const [malePercent, setMalePercent] = useState(initialSettings.malePercent ?? '');
  const [femalePercent, setFemalePercent] = useState(initialSettings.femalePercent ?? '');
  const [location, setLocation] = useState(initialSettings.location || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const normalizePercents = () => {
    const m = Number(malePercent);
    const f = Number(femalePercent);
    if (!Number.isFinite(m) && !Number.isFinite(f)) return [0, 0];
    if (Number.isFinite(m) && !Number.isFinite(f)) return [m, 100 - m];
    if (!Number.isFinite(m) && Number.isFinite(f)) return [100 - f, f];
    // both present — round and normalize to 100
    const total = m + f;
    if (total === 0) return [0, 0];
    const mm = Math.round((m / total) * 100);
    return [mm, 100 - mm];
  };

  const handleSave = async (e) => {
    e && e.preventDefault();
    setError('');
    setSaving(true);

    const [mRounded, fRounded] = normalizePercents();

    const payload = {
      schoolName,
      schoolType,
      studentCount,
      portionSize,
      malePercent: mRounded,
      femalePercent: fRounded,
      location,
    };

    try {
      await api.saveSettings(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved && onSaved(payload);
    } catch  {
      setError('Failed to save school profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-amber-900">Complete your school profile</h3>
          <div className="text-sm text-gray-500">Please provide a few details to get started</div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <input className="md:col-span-2 p-3 rounded border border-gray-200 shadow-sm" placeholder="School name" value={schoolName} onChange={e=>setSchoolName(e.target.value)} required />
          <select className="p-3 rounded border border-gray-200 shadow-sm" value={schoolType} onChange={e=>setSchoolType(e.target.value)}>
            <option>Primary</option>
            <option>Secondary</option>
            <option>High School</option>
            <option>Other</option>
          </select>
          <input type="number" className="p-3 rounded border border-gray-200 shadow-sm" placeholder="Student count" value={studentCount} onChange={e=>setStudentCount(e.target.value)} required />
          <input className="p-3 rounded border border-gray-200 shadow-sm" placeholder="Portion size" value={portionSize} onChange={e=>setPortionSize(e.target.value)} />
          <input type="number" className="p-3 rounded border border-gray-200 shadow-sm" placeholder="Male %" value={malePercent} onChange={e=>setMalePercent(e.target.value)} />
          <input type="number" className="p-3 rounded border border-gray-200 shadow-sm" placeholder="Female %" value={femalePercent} onChange={e=>setFemalePercent(e.target.value)} />
          <input className="md:col-span-4 p-3 rounded border border-gray-200 shadow-sm" placeholder="Location (city, country)" value={location} onChange={e=>setLocation(e.target.value)} />

          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-lg shadow">{saving ? 'Saving...' : 'Save'}</button>
            {saved && <span className="text-emerald-700 font-semibold">Saved</span>}
            {error && <span className="text-red-600">{error}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
