import React, { useState, useEffect } from 'react';
import { api } from './api';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import Actions from './pages/Actions';
import DataLogs from './pages/DataLogs';
import Settings from './pages/Settings';
import { 
  LayoutDashboard, 
  LineChart, 
  Sparkles, 
  ClipboardList, 
  Settings as SettingsIcon,
  LogOut,
  Utensils,
  Lock,
  Mail
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showConfidenceRanges, setShowConfidenceRanges] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      if (isSignup) {
        await api.signup(email, password);
      } else {
        await api.login(email, password);
      }
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err.message || 'Invalid login details.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <Utensils className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">SmartFoodSave</h1>
            <p className="text-sm text-slate-400">Cafeteria Management Login Dashboard</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-700">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="manager@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700" 
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 text-slate-700" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold transition shadow-md flex justify-center items-center gap-1.5"
            >
              {loginLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : isSignup ? 'Sign Up' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-slate-500 mt-2">
              {isSignup ? 'Already have an account?' : 'Need a new account?'}{' '}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header navbar */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Utensils className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">SmartFoodSave</span>
          </div>

          <nav className="hidden md:flex gap-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${
                activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('predictions')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${
                activeTab === 'predictions' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LineChart className="h-4 w-4" />
              Predictions
            </button>
            <button 
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${
                activeTab === 'actions' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Actions
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${
                activeTab === 'data' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Data
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${
                activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden border-t border-slate-100 flex justify-around p-2 bg-white">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-2.5 rounded-xl transition ${activeTab === 'dashboard' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveTab('predictions')}
            className={`p-2.5 rounded-xl transition ${activeTab === 'predictions' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
          >
            <LineChart className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveTab('actions')}
            className={`p-2.5 rounded-xl transition ${activeTab === 'actions' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
          >
            <Sparkles className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`p-2.5 rounded-xl transition ${activeTab === 'data' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
          >
            <ClipboardList className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-2.5 rounded-xl transition ${activeTab === 'settings' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'predictions' && <Predictions showConfidenceRanges={showConfidenceRanges} />}
        {activeTab === 'actions' && <Actions />}
        {activeTab === 'data' && <DataLogs />}
        {activeTab === 'settings' && (
          <Settings 
            showConfidenceRanges={showConfidenceRanges} 
            setShowConfidenceRanges={setShowConfidenceRanges} 
          />
        )}
      </main>
    </div>
  );
}
