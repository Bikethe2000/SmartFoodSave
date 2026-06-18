import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";

import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Predictions from "./pages/Predictions";
import Actions from "./pages/Actions";
import DataLogs from "./pages/DataLogs";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SchoolBanner from "./components/SchoolBanner";
import WeeklySchedulePro from "./pages/WeeklySchedule";
import AboutUs from "./pages/AboutUs";
import Documentation from "./pages/Documentation";
import ContactForm from "./components/ContactForm";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [settings, setSettings] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const clientPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  useEffect(() => {
    const unsubscribe = api.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated) {
      //setSettingsLoaded(false);
      api.getSettings()
        .then((s) => {
          if (!mounted) return;
          setSettings(s || {});
          setSettingsLoaded(true);
        })
        .catch(() => {
          if (!mounted) return;
          setSettings({});
          setSettingsLoaded(true);
        });
    } else {
      //setSettings(null);
      //uisetSettingsLoaded(false);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const renderProtected = (element) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!settingsLoaded) return <div className="p-8 text-center">Loading...</div>;
    return element;
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Inline banner shown on protected routes when profile incomplete */}
      {isAuthenticated && settingsLoaded && (!settings || !settings.schoolName) && ["/dashboard","/predictions","/data","/actions","/settings"].includes(clientPath) && (
        <SchoolBanner initialSettings={settings || {}} onSaved={(s)=>setSettings({...settings, ...s})} />
      )}

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="http://localhost:5174/" element={<Documentation />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={renderProtected(<Dashboard />)}
        />
        <Route
          path="/predictions"
          element={renderProtected(<Predictions />)}
        />
        <Route
          path="/weekly-schedule"
          element={renderProtected(<WeeklySchedulePro />)}
        />
        <Route
          path="/actions"
          element={renderProtected(<Actions />)}
        />
        <Route
          path="/data"
          element={renderProtected(<DataLogs />)}
        />
        <Route
          path="/settings"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" />
            ) : !settingsLoaded ? (
              <div className="p-8 text-center">Loading...</div>
            ) : (
              <Settings />
            )
          }
        />

        {/* Contact route */}
        <Route path="/contact" element={<ContactForm />} />

        {/* Login route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Signup route */}
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
        />
      
        {/* Fallback */}
         <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
