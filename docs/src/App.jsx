import { useState } from 'react';
import Documentation from './pages/Documentation';
import GettingStarted from './pages/GettingStarted';
import Setup from './pages/Setup';
import APIReference from './pages/APIReference';
import FAQ from './pages/FAQ';
import ContactForm from './components/ContactForm';
import { 
  BookOpen, 
  Zap,
  Cog,
  Code,
  HelpCircle,
  Mail,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('docs');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
          <h1 className="text-2xl font-bold text-slate-900">Food Waste AI Documentation</h1>
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
