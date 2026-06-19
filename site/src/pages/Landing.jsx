import { Link } from "react-router-dom";
import { Utensils, LineChart, Sparkles, ClipboardList, Award } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen sf-bg sf-text">
      <div className="w-full">
        {/* HERO SECTION */}
        <section className="pt-16 pb-32" style={{ background: 'linear-gradient(to bottom, rgba(5, 150, 105, 0.05), var(--sf-bg))' }}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            {/* Hackathon Badge */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full shadow-sm" style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--sf-primary)' }}>
                <Award className="h-6 w-6" style={{ color: 'var(--sf-primary)' }} />
                <span className="font-semibold">
                  Built for USAII Global AI Hackathon 2026
                </span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl shadow-sm" style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--sf-primary)' }}>
                <Utensils className="h-10 w-10" style={{ color: 'var(--sf-primary)' }} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-extrabold leading-tight mb-6 sf-text">
              Make Your Cafeteria Smarter with{" "}
              <span style={{ color: 'var(--sf-primary)' }}>AI‑Powered Food Waste Insights</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg max-w-3xl mx-auto mb-10 sf-text-muted">
              SmartFoodSave helps schools predict food waste, optimize portions, and take meaningful action.
              Built for real cafeteria staff — simple, practical, and powered by machine learning.
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to="/dashboard"
                className="px-8 py-4 text-white rounded-xl text-lg font-bold shadow-md transition hover:opacity-90"
                style={{ background: 'var(--sf-primary)', color: 'white' }}
              >
                Enter Dashboard
              </Link>

              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl text-lg font-bold shadow-sm transition"
                style={{ 
                  background: 'var(--sf-card)',
                  border: '1px solid var(--sf-border)',
                  color: 'var(--sf-text)'
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 sf-bg">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold sf-text text-center mb-16">
              How SmartFoodSave Supports Your Cafeteria
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl shadow-sm text-center hover:shadow-md transition" style={{ background: 'var(--sf-bg-secondary)' }}>
                <LineChart className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--sf-primary)' }} />
                <h3 className="text-xl font-bold sf-text mb-2">AI Predictions</h3>
                <p className="sf-text-muted">
                  Forecast daily food waste and portion needs using machine learning trained on your cafeteria’s
                  patterns.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl shadow-sm text-center hover:shadow-md transition" style={{ background: 'var(--sf-bg-secondary)' }}>
                <Sparkles className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--sf-primary)' }} />
                <h3 className="text-xl font-bold sf-text mb-2">Smart Recommendations</h3>
                <p className="sf-text-muted">
                  Get clear, actionable suggestions to reduce waste — from portion adjustments to menu insights.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl shadow-sm text-center hover:shadow-md transition" style={{ background: 'var(--sf-bg-secondary)' }}>
                <ClipboardList className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--sf-primary)' }} />
                <h3 className="text-xl font-bold sf-text mb-2">Daily Logging</h3>
                <p className="sf-text-muted">
                  Easily track prepared, served, and leftover portions to build accurate historical data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 text-white text-center" style={{ background: 'var(--sf-primary)' }}>
          <h2 className="text-4xl font-extrabold mb-6">Start Reducing Waste Today</h2>
          <p className="text-lg max-w-2xl mx-auto mb-10" style={{ opacity: 0.9 }}>
            Join schools taking real climate action through simple, everyday decisions powered by AI.
          </p>

          <Link
            to="/signup"
            className="px-10 py-4 rounded-xl text-lg font-bold shadow-lg hover:opacity-90 transition"
            style={{ 
              background: 'white',
              color: 'var(--sf-primary)'
            }}
          >
            Get Started
          </Link>
        </section>
      </div>
    </div>
  );
}

