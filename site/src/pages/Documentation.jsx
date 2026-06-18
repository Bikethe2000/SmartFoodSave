import { BookOpen, BarChart3, Settings, HelpCircle } from "lucide-react";

export default function Documentation() {
  return (
    <div className="w-full pt-24">
      {/* HERO SECTION */}
      <section className="pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-slate-800 leading-tight mb-6">
            <span className="text-blue-600">Documentation</span> & Help
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Learn how to use SmartFoodSave to optimize your school's meal planning and reduce food waste.
          </p>
        </div>
      </section>

      {/* NAVIGATION CARDS */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Getting Started */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-8 shadow-sm border border-emerald-200 cursor-pointer hover:shadow-md transition">
              <BookOpen className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Getting Started</h3>
              <p className="text-slate-700 mb-4">
                New to SmartFoodSave? Learn how to set up your school profile, input your first data logs, 
                and access the dashboard.
              </p>
              <a href="#getting-started" className="text-emerald-600 font-semibold hover:text-emerald-700">
                Read Guide →
              </a>
            </div>

            {/* Predictions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 shadow-sm border border-blue-200 cursor-pointer hover:shadow-md transition">
              <BarChart3 className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Understanding Predictions</h3>
              <p className="text-slate-700 mb-4">
                Learn how our AI model predicts food waste, interpreting risk levels, and using predictions 
                to optimize your meal planning.
              </p>
              <a href="#predictions" className="text-blue-600 font-semibold hover:text-blue-700">
                Learn More →
              </a>
            </div>

            {/* Settings */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 shadow-sm border border-purple-200 cursor-pointer hover:shadow-md transition">
              <Settings className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Settings & Configuration</h3>
              <p className="text-slate-700 mb-4">
                Configure your school's profile, manage weekly schedules, set portion sizes, 
                and customize your preferences.
              </p>
              <a href="#settings" className="text-purple-600 font-semibold hover:text-purple-700">
                Configure →
              </a>
            </div>

            {/* FAQ */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-8 shadow-sm border border-orange-200 cursor-pointer hover:shadow-md transition">
              <HelpCircle className="h-8 w-8 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">FAQ</h3>
              <p className="text-slate-700 mb-4">
                Common questions about data privacy, accuracy, integration, and best practices 
                for using SmartFoodSave.
              </p>
              <a href="#faq" className="text-orange-600 font-semibold hover:text-orange-700">
                View FAQs →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* GETTING STARTED SECTION */}
      <section id="getting-started" className="py-16 bg-emerald-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Getting Started Guide</h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">1. Create Your School Account</h3>
              <ul className="space-y-3 text-slate-700">
                <li>• Visit the sign-up page and enter your school's name and contact information</li>
                <li>• Verify your school email to confirm your account</li>
                <li>• You'll be taken to the dashboard to begin setup</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">2. Configure Your School Profile</h3>
              <ul className="space-y-3 text-slate-700">
                <li>• Go to <strong>Settings</strong> and fill in your school details</li>
                <li>• <strong>Location:</strong> Your school's region (affects regional food preference analysis)</li>
                <li>• <strong>School Type:</strong> Middle School, High School, etc.</li>
                <li>• <strong>Student Count:</strong> Total number of students</li>
                <li>• <strong>Gender Distribution:</strong> Percentage of male/female students (affects consumption patterns)</li>
                <li>• <strong>Portion Size:</strong> Standard portion weight for your cafeteria</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">3. Start Logging Daily Data</h3>
              <ul className="space-y-3 text-slate-700">
                <li>• Go to <strong>Data Logs</strong> to record each day's meal information</li>
                <li>• Enter: Menu items, prepared portions, actual attendance, and leftovers</li>
                <li>• The more data you log, the more accurate our predictions become</li>
                <li>• Historical data is valuable—consider logging past meal records if available</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">4. View Predictions & Insights</h3>
              <ul className="space-y-3 text-slate-700">
                <li>• Access <strong>Predictions</strong> to see AI-generated waste forecasts</li>
                <li>• Use predictions to adjust portion sizes and menu planning</li>
                <li>• Check <strong>Dashboard</strong> for visual trends and historical waste metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PREDICTIONS SECTION */}
      <section id="predictions" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Understanding Predictions</h2>
          
          <div className="space-y-8">
            <div className="bg-blue-50 rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Risk Levels</h3>
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-green-600 text-white rounded font-semibold">Low</span>
                  <p className="mt-2 text-slate-700">Predicted waste under 1 portion. Meal is likely well-received.</p>
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-yellow-500 text-white rounded font-semibold">Medium</span>
                  <p className="mt-2 text-slate-700">Predicted waste between 1-3 portions. Monitor and consider adjustments.</p>
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-red-600 text-white rounded font-semibold">High</span>
                  <p className="mt-2 text-slate-700">Predicted waste over 3 portions. Consider reducing portions or offering alternatives.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Demographic Insights</h3>
              <p className="text-slate-700 mb-4">
                Our AI adjusts predictions based on your school's demographics:
              </p>
              <ul className="space-y-3 text-slate-700">
                <li>• <strong>Gender Distribution:</strong> Male-dominated schools often show different consumption patterns</li>
                <li>• <strong>School Type:</strong> High schoolers tend to be more selective about meals</li>
                <li>• <strong>School Size:</strong> Larger schools typically have better meal planning and lower waste</li>
                <li>• <strong>Location:</strong> Regional preferences and seasonal availability affect meal acceptance</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Waste Per Student Metric</h3>
              <p className="text-slate-700">
                This shows how much each student contributes to waste. Tracking this metric helps you 
                understand portion sizes relative to actual student needs and identify when portions are too generous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SETTINGS SECTION */}
      <section id="settings" className="py-16 bg-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Settings & Configuration</h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Weekly Schedule</h3>
              <p className="text-slate-700 mb-4">
                Set your cafeteria's weekly meal schedule. This helps the AI understand meal patterns 
                and provide more accurate predictions.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li>• Define what meal is served each day of the week</li>
                <li>• Update when menus change seasonally</li>
                <li>• View historical patterns for each meal</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Portion Sizes</h3>
              <p className="text-slate-700 mb-4">
                Configure standard portion sizes used in your cafeteria. This affects how waste predictions 
                are calculated and normalized.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li>• Define portion weight (e.g., 250g, 300g)</li>
                <li>• Adjust for different meal types if needed</li>
                <li>• Use consistent measurements for accurate tracking</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">School Profile</h3>
              <p className="text-slate-700 mb-4">
                Update your school's demographic information. This data improves prediction accuracy 
                and helps our AI understand your unique school context.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li>• Location (used for regional food preference analysis)</li>
                <li>• Student count and gender distribution</li>
                <li>• School type (affects meal preferences)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-3">How accurate are the waste predictions?</h4>
              <p className="text-slate-700">
                Accuracy improves over time as we collect more data about your school's eating patterns. 
                After 3-4 weeks of consistent data logging, predictions typically achieve 75-85% accuracy. 
                Schools with 2+ months of data often see 85-90%+ accuracy.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-3">Is my school's data private?</h4>
              <p className="text-slate-700">
                Yes. All data is encrypted and stored securely. We only use your data to generate predictions 
                for your school. We never share individual school data with third parties. Aggregate, 
                anonymized insights may be used for research.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-3">How often should we update data logs?</h4>
              <p className="text-slate-700">
                We recommend logging data daily after each meal service. Consistency is key for model accuracy. 
                Even just logging total attendance and leftover counts is valuable. More detailed data 
                (meal items, portions prepared) further improves predictions.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-3">Can we import historical data?</h4>
              <p className="text-slate-700">
                Yes! Contact our support team to discuss bulk data imports. Historical data from previous months 
                or years can significantly accelerate model training and improve prediction accuracy from day one.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-3">What do the demographic adjustments mean?</h4>
              <p className="text-slate-700">
                Our AI adjusts base waste predictions based on your school's demographics (gender distribution, 
                school type, size, location). These adjustments fine-tune predictions to account for eating behavior 
                differences. For example, high schools often show different waste patterns than middle schools.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-3">How can we reduce waste based on predictions?</h4>
              <p className="text-slate-700">
                <strong>Use these strategies:</strong>
              </p>
              <ul className="mt-3 space-y-2 text-slate-700">
                <li>• Reduce portions for meals predicted as "High" waste</li>
                <li>• Substitute unpopular meals with alternatives suggested by our system</li>
                <li>• Plan special events or promotions for historically wasteful meals</li>
                <li>• Track your progress in the Dashboard to celebrate wins</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-3">What if predictions seem off?</h4>
              <p className="text-slate-700">
                Predictions improve with more data. Early on, they may not perfectly match your experience. 
                Continue logging data consistently. If issues persist, check:
              </p>
              <ul className="mt-3 space-y-2 text-slate-700">
                <li>• Is your school profile (demographics) up to date?</li>
                <li>• Are you logging attendance and leftovers consistently?</li>
                <li>• Have special events occurred that skew normal patterns?</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-16 bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Need More Help?</h2>
          <p className="text-lg mb-8">
            Contact our support team or check back regularly for new documentation and tutorials.
          </p>
          <a
            href="mailto:support@smartfoodsave.com"
            className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-xl text-lg font-bold hover:bg-emerald-700 transition"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-700 text-slate-300 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 SmartFoodSave. | <a href="/about" className="hover:text-white">About Us</a> | <a href="http://localhost:5174/" className="hover:text-white">Documentation</a></p>
        </div>
      </footer>
    </div>
  );
}
