import React, { useState, useEffect } from 'react';
import { api } from './api';
import Documentation from './pages/Documentation';
import GettingStarted from './pages/GettingStarted';
import Setup from './pages/Setup';
import APIReference from './pages/APIReference';
import FAQ from './pages/FAQ';
import { 
  BookOpen, 
  Zap,
  Cog,
  Code,
  HelpCircle,
  LogOut,
  Mail,
  Lock,
  Search,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [activeTab, setActiveTab] = useState('docs');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      setEmail('');
      setPassword('');
    } catch (err) {
      setLoginError(err.message || 'Invalid login details.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setIsAuthenticated(false);
      setActiveTab('docs');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'setup', label: 'Setup Guide', icon: Cog },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'docs':
        return <Documentation />;
      case 'getting-started':
        return <GettingStarted />;
      case 'setup':
        return <Setup />;
      case 'api':
        return <APIReference />;
      case 'faq':
        return <FAQ />;
      default:
        return <Documentation />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode 
          ? 'bg-slate-900' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      }`}>
        <div className={`rounded-lg shadow-xl p-8 w-full max-w-md ${
          darkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h1 className={`text-3xl font-bold mb-2 text-center ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            🍽️ Food Waste AI
          </h1>
          <p className={`text-center mb-8 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Documentation Portal
          </p>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Mail className="inline mr-2" size={16} />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Lock className="inline mr-2" size={16} />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {loginLoading ? 'Loading...' : isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className={`text-sm transition ${
                darkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-500 hover:underline'
              }`}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`absolute top-4 right-4 p-2 rounded-lg transition ${
              darkMode ? 'bg-slate-700' : 'bg-slate-200'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Header */}
      <header className={`border-b shadow-sm ${
        darkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              🍽️ Food Waste AI Docs
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg ${
              darkMode 
                ? 'bg-slate-700' 
                : 'bg-slate-100'
            }`}>
              <Search size={18} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent outline-none px-2 text-sm ${
                  darkMode 
                    ? 'text-white placeholder-slate-400' 
                    : 'text-slate-900 placeholder-slate-600'
                }`}
              />
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition ${
                darkMode 
                  ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 lg:border-r lg:border-slate-200 p-6 lg:min-h-screen ${
          darkMode 
            ? 'bg-slate-800 lg:border-slate-700' 
            : 'bg-white'
        }`}>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                    activeTab === item.id
                      ? darkMode 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-blue-100 text-blue-700'
                      : darkMode 
                        ? 'text-slate-300 hover:bg-slate-700' 
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-hidden">
          <div className={`max-w-4xl mx-auto ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
