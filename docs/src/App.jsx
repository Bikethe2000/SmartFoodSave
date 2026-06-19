import { Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import Documentation from './pages/Documentation';
import GettingStarted from './pages/GettingStarted';
import Setup from './pages/Setup';
import APIReference from './pages/APIReference';
import FAQ from './pages/FAQ';
import ContactForm from './components/ContactForm';

import { BookOpen, Zap, Cog, Code, HelpCircle, Mail, Menu, X } from 'lucide-react';
import ThemeToggleButton from './themeToggle';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'docs', label: 'Documentation', icon: BookOpen, path: '/docs' },
    { id: 'getting-started', label: 'Getting Started', icon: Zap, path: '/getting-started' },
    { id: 'setup', label: 'Setup Guide', icon: Cog, path: '/setup' },
    { id: 'api', label: 'API Reference', icon: Code, path: '/api' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, path: '/faq' },
    { id: 'contact', label: 'Contact Us', icon: Mail, path: '/contact' },
  ];

  return (
    <div className="min-h-screen sf-bg sf-text">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              🍽️ Food Waste AI Docs
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="lg:flex items-center gap-6">
            {navItems.map((item) => {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition font-medium"
            >
              Contact Us
            </Link>
            <ThemeToggleButton />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>


      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-8 overflow-hidden">
        <div className="max-w-4xl mx-auto">

          <Routes>
            <Route path="/" element={<Documentation />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/api" element={<APIReference />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<ContactForm />} />
          </Routes>

        </div>
      </main>
    </div>
  );
}
