import { Heart, Users, Lightbulb, Globe } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="w-full pt-24">
      {/* HERO SECTION */}
      <section className="pb-16 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-slate-800 leading-tight mb-6">
            About <span className="text-emerald-600">SmartFoodSave</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Fighting food waste in schools through AI, data, and community action.
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-4">
                Every year, schools waste thousands of kilograms of food. This isn't just about money—it's about 
                resources, sustainability, and our responsibility to the next generation.
              </p>
              <p className="text-lg text-slate-600 mb-4">
                SmartFoodSave empowers school cafeterias with AI-driven insights to predict waste, optimize 
                meal planning, and make data-informed decisions that reduce waste while maintaining nutritional quality.
              </p>
              <p className="text-lg text-slate-600">
                We believe that small, smart actions compound into meaningful environmental and economic impact.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="p-8 bg-emerald-100 rounded-2xl">
                <Heart className="h-24 w-24 text-emerald-600 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY VALUES SECTION */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">What We Stand For</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sustainability */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <Globe className="h-8 w-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-800">Sustainability</h3>
              </div>
              <p className="text-slate-600">
                We're committed to reducing food waste and environmental impact. Food waste accounts for 
                significant greenhouse gas emissions—let's change that together.
              </p>
            </div>

            {/* Data-Driven */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <Lightbulb className="h-8 w-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-800">Data-Driven</h3>
              </div>
              <p className="text-slate-600">
                Machine learning and predictive analytics give schools the tools to make smarter, faster decisions 
                based on real historical data, not guesswork.
              </p>
            </div>

            {/* Community-Focused */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-800">Community-Focused</h3>
              </div>
              <p className="text-slate-600">
                Schools are community centers. By helping them reduce waste, we improve health, save money, 
                and demonstrate environmental responsibility to students.
              </p>
            </div>

            {/* Innovation */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <Lightbulb className="h-8 w-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-800">Innovation</h3>
              </div>
              <p className="text-slate-600">
                We continually improve our models, integrate new data sources, and refine our insights 
                to deliver the most accurate predictions and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-600 text-white font-bold text-lg">1</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Record Daily Data</h3>
                <p className="text-slate-600">
                  Schools log meal information, attendance, and leftovers each day. Our system securely stores 
                  and organizes this data.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-600 text-white font-bold text-lg">2</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI Learns Patterns</h3>
                <p className="text-slate-600">
                  Our machine learning models analyze historical data, meal types, attendance trends, 
                  and demographic factors to identify waste patterns.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-600 text-white font-bold text-lg">3</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Get Predictions</h3>
                <p className="text-slate-600">
                  Receive daily waste predictions for each meal, helping staff adjust portion sizes 
                  and menu planning decisions before waste happens.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-600 text-white font-bold text-lg">4</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Take Action</h3>
                <p className="text-slate-600">
                  Use insights to reduce portions for high-waste meals, suggest alternatives, 
                  and optimize your weekly schedule. Track progress over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Cafeteria?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join schools across Greece that are reducing waste, saving money, and making a difference.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-xl text-lg font-bold hover:bg-slate-100 transition"
          >
            Get Started Today
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-800 text-slate-300 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 SmartFoodSave. Fighting food waste with AI. | Privacy Policy | Contact Us</p>
        </div>
      </footer>
    </div>
  );
}
