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
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl text-emerald-600">SmartFoodSave</Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-slate-700 hover:text-slate-900 font-medium">Dashboard</Link>
              <Link to="/weekly-schedule" className="text-slate-700 hover:text-slate-900 font-medium">Schedule</Link>
              <Link to="/predictions" className="text-slate-700 hover:text-slate-900 font-medium">Predictions</Link>
              <Link to="/data" className="text-slate-700 hover:text-slate-900 font-medium">Data</Link>
              <Link to="/settings" className="text-slate-700 hover:text-slate-900 font-medium">Settings</Link>
              <button onClick={handleLogout} className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition font-medium">Logout</button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/" className="text-slate-700 hover:text-slate-900 font-medium">Home</Link>
              <Link to="/about" className="text-slate-700 hover:text-slate-900 font-medium">About Us</Link>
              <Link to="http://localhost:5174/" className="text-slate-700 hover:text-slate-900 font-medium">Documentation</Link>
              <Link to="/login" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition font-medium">Sign in</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
