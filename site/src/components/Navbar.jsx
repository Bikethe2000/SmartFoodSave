import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../api";

export default function Navbar({ isAuthenticated: initialAuth }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = api.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <header className="w-full sf-card shadow-sm fixed top-0 left-0 z-50 border-b sf-border bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-extrabold text-xl sf-primary">
          SmartFoodSave
        </Link>

        {/* Hamburger Button (Mobile) */}
        <button
          className="md:hidden flex flex-col gap-1.5 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-black transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`h-0.5 w-6 bg-black transition ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`h-0.5 w-6 bg-black transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="sf-text hover:sf-primary font-medium transition">Dashboard</Link>
              <Link to="/weekly-schedule" className="sf-text hover:sf-primary font-medium transition">Schedule</Link>
              <Link to="/predictions" className="sf-text hover:sf-primary font-medium transition">Predictions</Link>
              <Link to="/data" className="sf-text hover:sf-primary font-medium transition">Data</Link>
              <Link to="/settings" className="sf-text hover:sf-primary font-medium transition">Settings</Link>
              <Link to="/contact" className="sf-text hover:sf-primary font-medium transition">Contact</Link>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 sf-primary-bg text-white rounded-md hover:opacity-90 transition font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="sf-text hover:sf-primary font-medium transition">Home</Link>
              <Link to="/about" className="sf-text hover:sf-primary font-medium transition">About Us</Link>
              <Link to="https://docs.smartfoodsave.xyz" className="sf-text hover:sf-primary font-medium transition">Documentation</Link>
              <Link
                to="/login"
                className="px-4 py-2 sf-primary-bg text-white rounded-md hover:opacity-90 transition font-medium"
                style={{ color: 'white' }}
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t sf-border transition-all overflow-hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Dashboard</Link>
              <Link to="/weekly-schedule" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Schedule</Link>
              <Link to="/predictions" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Predictions</Link>
              <Link to="/data" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Data</Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Settings</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Contact</Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="px-4 py-2 sf-primary-bg text-white rounded-md font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Home</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="sf-text font-medium">About Us</Link>
              <Link to="https://docs.smartfoodsave.xyz" onClick={() => setMenuOpen(false)} className="sf-text font-medium">Documentation</Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 sf-primary-bg text-white rounded-md font-medium text-center"
                style={{ color: 'white' }}
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
