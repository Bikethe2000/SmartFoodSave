import { useState } from 'react';
import ThemeInitializer from './themeProvider';
import Documentation from './pages/Documentation';
import GettingStarted from './pages/GettingStarted';
import Setup from './pages/Setup';
import APIReference from './pages/APIReference';
import FAQ from './pages/FAQ';
import ContactForm from './components/ContactForm';
import { BookOpen, Zap, Cog, Code, HelpCircle, Mail, Menu, X } from 'lucide-react';
import ThemeToggleButton from './themeToggle';

export default function App() {
  const [activeTab, setActiveTab] = useState('docs');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'setup', label: 'Setup Guide', icon: Cog },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact Us', icon: Mail },
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
      case 'contact':
        return <ContactForm />;
      default:
        return <Documentation />;
    }
  };

  return (
    <div className="min-h-screen sf-bg sf-text">
      <ThemeInitializer />

      {/* Header */}
      <header className="border-b shadow-sm sf-card sf-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-700 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold">
              🍽️ Food Waste AI Docs
            </h1>
          </div>

          <ul className="lg:flex items-center gap-6 hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition font-medium ${
                      activeTab === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 lg:border-r sf-border p-6 lg:min-h-screen sf-card`}
        >
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                    activeTab === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
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
          <div className="max-w-4xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

