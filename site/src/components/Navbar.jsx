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

        <nav className="flex items-center gap-4">
          {/* <Link to="/" className="text-slate-700 hover:text-slate-900">Home</Link> */}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="ml-200 text-slate-700 hover:text-slate-900">Dashboard</Link>
              <Link to="/predictions" className="text-slate-700 hover:text-slate-900">Predictions</Link>
              <Link to="/data" className="text-slate-700 hover:text-slate-900">Data</Link>
              <Link to="/settings" className="text-slate-700 hover:text-slate-900">Settings</Link>
              <button onClick={handleLogout} className="ml-4 px-3 py-1 bg-emerald-600 text-white rounded-md">Logout</button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="px-3 py-1 bg-emerald-600 text-white rounded-md">Sign in</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
