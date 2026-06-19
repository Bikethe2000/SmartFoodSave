import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../api";

export default function Navbar({ isAuthenticated: initialAuth }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
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
    <header className="w-full sf-card shadow-sm fixed top-0 left-0 z-50 border-b sf-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      
        <Link to="/" className="font-extrabold text-xl sf-primary">SmartFoodSave</Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="sf-text hover:sf-primary font-medium transition">Dashboard</Link>
              <Link to="/weekly-schedule" className="sf-text hover:sf-primary font-medium transition">Schedule</Link>
              <Link to="/predictions" className="sf-text hover:sf-primary font-medium transition">Predictions</Link>
              <Link to="/data" className="sf-text hover:sf-primary font-medium transition">Data</Link>
              <Link to="/settings" className="sf-text hover:sf-primary font-medium transition">Settings</Link>
              <Link to="/contact" className="sf-text hover:sf-primary font-medium transition">Contact</Link>
              <button onClick={handleLogout} className="ml-4 px-4 py-2 sf-primary-bg text-white rounded-md hover:opacity-90 transition font-medium">Logout</button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/" className="sf-text hover:sf-primary font-medium transition">Home</Link>
              <Link to="/about" className="sf-text hover:sf-primary font-medium transition">About Us</Link>
              <Link to="http://localhost:5174/" className="sf-text hover:sf-primary font-medium transition">Documentation</Link>
              <Link to="/login" className="px-4 py-2 sf-primary-bg text-white rounded-md hover:opacity-90 transition font-medium" style={{ color: 'white' }}
>Sign in</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
