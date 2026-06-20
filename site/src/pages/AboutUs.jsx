import { Heart, Users, Lightbulb, Globe, ShieldCheck, Award, Calendar } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="w-full pt-24 sf-bg sf-text top-0 left-0">
      {/* HERO SECTION */}
      <section className="pb-16" style={{ background: 'linear-gradient(to bottom, rgba(5, 150, 105, 0.05), var(--sf-bg))' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full shadow-sm" style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--sf-primary)' }}>
            <Award className="h-6 w-6" style={{ color: 'var(--sf-primary)' }} />
              <span className="font-semibold">
                Built for USAII Global AI Hackathon 2026
              </span>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold sf-text leading-tight mb-6">
            About <span style={{ color: 'var(--sf-primary)' }}>SmartFoodSave</span>
          </h1>
          <p className="text-xl sf-text-muted max-w-3xl mx-auto">
            A student‑built initiative transforming food waste from an invisible problem into a visible, solvable challenge through AI and community action.
          </p>
        </div>
      </section>

      {/* WHY WE BUILT THIS */}
      <section className="py-16 sf-bg">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold sf-text mb-6 text-center">Why We Built SmartFoodSave</h2>
          <p className="text-lg sf-text-muted max-w-4xl mx-auto text-center mb-6">
            Food waste is one of the most overlooked environmental challenges inside schools. Meals are prepared with care, yet many end up uneaten—not because people don't care, but because schools lack the tools to understand patterns, anticipate needs, and act early.
          </p>
          <p className="text-lg sf-text-muted max-w-4xl mx-auto text-center">
            SmartFoodSave was born from a simple belief: when students and staff are empowered with clear insights, they can make meaningful, lasting change. Our project is not just a technical solution—it is a commitment to sustainability, responsibility, and the idea that small actions can create a ripple of positive impact across entire communities.
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-16" style={{ background: 'var(--sf-bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold sf-text mb-6">Our Mission</h2>
              <p className="text-lg sf-text-muted mb-4">
                Our mission is to help schools understand their environmental footprint in a way that is accessible, actionable, and grounded in real daily life. Food waste represents lost resources, unnecessary emissions, and missed opportunities to build a more sustainable culture.
              </p>
              <p className="text-lg sf-text-muted mb-4">
                SmartFoodSave equips cafeteria staff with AI‑powered predictions, clear explanations, and practical recommendations. By transforming raw data into meaningful insights, we help schools plan smarter, reduce waste, and make decisions that benefit both the environment and the school community.
              </p>
              <p className="text-lg sf-text-muted">
                We believe that when technology is used responsibly and thoughtfully, it becomes a powerful ally in shaping a better future for students and the planet.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
                <Heart className="h-24 w-24" style={{ color: 'var(--sf-primary)' }} mx-auto />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY VALUES SECTION */}
      <section className="py-16 sf-bg">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold sf-text text-center mb-12">What We Stand For</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sustainability */}
            <div className="rounded-lg p-8 shadow-sm" style={{ background: 'var(--sf-bg-secondary)' }}>
              <div className="flex items-center gap-4 mb-4">
                <Globe className="h-8 w-8" style={{ color: 'var(--sf-primary)' }} />
                <h3 className="text-2xl font-bold sf-text">Sustainability</h3>
              </div>
              <p className="sf-text-muted">
                Every kilogram of food saved means fewer emissions, fewer resources wasted, and a healthier planet for future generations.
              </p>
            </div>

            {/* Data-Driven */}
            <div className="rounded-lg p-8 shadow-sm" style={{ background: 'var(--sf-bg-secondary)' }}>
              <div className="flex items-center gap-4 mb-4">
                <Lightbulb className="h-8 w-8" style={{ color: 'var(--sf-primary)' }} />
                <h3 className="text-2xl font-bold sf-text">Data-Driven Insight</h3>
              </div>
              <p className="sf-text-muted">
                Our AI models analyze historical patterns, attendance trends, and menu data to help schools make informed decisions—not guesses.
              </p>
            </div>

            {/* Community-Focused */}
            <div className="rounded-lg p-8 shadow-sm" style={{ background: 'var(--sf-bg-secondary)' }}>
              <div className="flex items-center gap-4 mb-4">
                <Users className="h-8 w-8" style={{ color: 'var(--sf-primary)' }} />
                <h3 className="text-2xl font-bold sf-text">Community Impact</h3>
              </div>
              <p className="sf-text-muted">
                Schools are the heart of local communities. Reducing waste supports healthier budgets, better nutrition, and a culture of environmental responsibility.
              </p>
            </div>

            {/* Innovation */}
            <div className="rounded-lg p-8 shadow-sm" style={{ background: 'var(--sf-bg-secondary)' }}>
              <div className="flex items-center gap-4 mb-4">
                <Lightbulb className="h-8 w-8" style={{ color: 'var(--sf-primary)' }} />
                <h3 className="text-2xl font-bold sf-text">Innovation</h3>
              </div>
              <p className="sf-text-muted">
                We continuously refine our models and improve our recommendations to ensure SmartFoodSave remains accurate, reliable, and impactful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPMENT TIMELINE */}
      <section className="py-16" style={{ background: 'var(--sf-bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold sf-text text-center mb-12">Development Timeline</h2>

          <div className="space-y-10">
            {[
              { date: "June 14", title: "Concept & Research", desc: "Identified the core problem of food waste in school cafeterias and defined our AI-driven approach." },
              { date: "June 15", title: "Design & Architecture", desc: "Created the system flow, UI wireframes, and backend architecture for predictions and recommendations." },
              { date: "June 16–18", title: "Development", desc: "Built the dashboard, mobile interface, API endpoints, and AI engine using synthetic data." },
              { date: "June 19–20", title: "Testing & Refinement", desc: "Improved model accuracy, added responsible AI safeguards, and polished the user experience." },
              { date: "June 21", title: "Final Submission", desc: "Prepared the pitch video, documentation, and final Devpost submission." }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md text-white font-bold text-lg" style={{ background: 'var(--sf-primary)' }}>
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold sf-text mb-1">{item.date}</h3>
                  <p className="sf-text font-semibold">{item.title}</p>
                  <p className="sf-text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESPONSIBLE AI SECTION */}
      <section className="py-16 sf-bg">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold sf-text text-center mb-12">Responsible AI</h2>

          <div className="p-8 rounded-xl shadow-sm max-w-4xl mx-auto" style={{ background: 'var(--sf-bg-secondary)' }}>
            <div className="flex items-center gap-4 mb-4">
              <ShieldCheck className="h-10 w-10" style={{ color: 'var(--sf-primary)' }} />
              <h3 className="text-2xl font-bold sf-text">Our Commitment</h3>
            </div>

            <p className="sf-text-muted mb-4">
              SmartFoodSave is designed with transparency, safety, and human oversight at its core. 
              We recognize that predictions can be imperfect, and real-world decisions must always remain in human hands.
            </p>

            <ul className="list-disc pl-6 sf-text-muted space-y-2">
              <li><strong className="sf-text">Risk Identified:</strong> AI predictions may be inaccurate due to limited or synthetic data.</li>
              <li><strong className="sf-text">Mitigation:</strong> We display confidence ranges, explain assumptions, and provide clear reasoning for each prediction.</li>
              <li><strong className="sf-text">Human-in-the-Loop:</strong> The AI never makes final ordering decisions—cafeteria staff always remain in control.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-16" style={{ background: 'var(--sf-bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold sf-text mb-6">Our Team</h2>
          <p className="text-lg sf-text-muted max-w-3xl mx-auto mb-12">
            We are a two‑member high‑school team passionate about using AI to create real environmental impact.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Member 1 */}
            <div className="sf-bg p-8 rounded-xl shadow-sm">
              <img
                src="/images/team/egw.png"
                alt="Konstantinos"
                className="h-40 w-40 object-cover rounded-full mx-auto mb-4 shadow-md"
              />
              <h3 className="text-xl font-bold sf-text">Konstantinos Mavridis</h3>
              <p className="sf-text-muted mt-2">Backend & AI Lead</p>
            </div>

            {/* Member 2 */}
            <div className="sf-bg p-8 rounded-xl shadow-sm">
              <img
                src="/images/team/soulis.jpg"
                alt="Anastasis"
                className="h-40 w-40 object-cover rounded-full mx-auto mb-4 shadow-md"
              />
              <h3 className="text-xl font-bold sf-text">Anastasis Karaivazoglou</h3>
              <p className="sf-text-muted mt-2">Frontend & UX Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 text-white text-center" style={{ background: 'var(--sf-primary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Cafeteria?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ opacity: 0.9 }}>
            Join schools across Greece that are reducing waste, saving money, and making a difference.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition"
            style={{ background: 'white', color: 'var(--sf-primary)' }}
          >
            Get Started Today
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sf-bg sf-text-muted py-8" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 SmartFoodSave. Fighting food waste with AI. | Privacy Policy | Contact Us</p>
        </div>
      </footer>
    </div>
  );
}
