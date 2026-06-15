import { Link } from "react-router-dom";
import { Utensils, LineChart, Sparkles, ClipboardList } from "lucide-react";

export default function Landing() {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="pt-24 pb-32 bg-linear-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-700 shadow-sm">
              <Utensils className="h-10 w-10" />
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-slate-800 leading-tight mb-6">
            Reduce Food Waste with <span className="text-emerald-600">AI‑Powered Insights</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            SmartFoodSave helps school cafeterias predict waste, optimize portions, 
            and take meaningful action using real‑time data and machine learning.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-lg font-bold shadow-md transition"
            >
              Enter Dashboard
            </Link>

            <Link
              to="/signup"
              className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-lg font-bold shadow-sm transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-16">
            How SmartFoodSave Helps Your Cafeteria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 bg-slate-50 rounded-2xl shadow-sm text-center">
              <LineChart className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">AI Predictions</h3>
              <p className="text-slate-600">
                Forecast daily food waste and portion needs using machine learning.
              </p>
            </div>

            <div className="p-8 bg-slate-50 rounded-2xl shadow-sm text-center">
              <Sparkles className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Smart Actions</h3>
              <p className="text-slate-600">
                Receive actionable recommendations to reduce waste and improve efficiency.
              </p>
            </div>

            <div className="p-8 bg-slate-50 rounded-2xl shadow-sm text-center">
              <ClipboardList className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Daily Logs</h3>
              <p className="text-slate-600">
                Track prepared, served, and leftover portions with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-emerald-600 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-6">
          Ready to Make Your Cafeteria Smarter?
        </h2>
        <p className="text-lg max-w-2xl mx-auto mb-10 opacity-90">
          Join schools reducing waste and improving sustainability with AI‑powered tools.
        </p>

        <Link
          to="/signup"
          className="px-10 py-4 bg-white text-emerald-700 rounded-xl text-lg font-bold shadow-lg hover:bg-slate-100 transition"
        >
          Get Started Today
        </Link>
      </section>
    </div>
  );
}
