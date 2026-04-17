import { Link } from "react-router-dom";
import { Bot, Sparkles, Pill, Dna, CloudRain, FileText, Activity, ShieldAlert } from 'lucide-react';

const features = [
  { icon: <Bot size={32} className="text-blue-500" />, title: "AI-Powered Risk Prediction", desc: "Advanced AI analyzes your symptoms, medical history, and genetics to predict disease risks." },
  { icon: <Sparkles size={32} className="text-purple-500" />, title: "What-If Scenario Analyzer", desc: "See how lifestyle changes would impact your health in 1, 5, and 10 years." },
  { icon: <Pill size={32} className="text-rose-500" />, title: "Drug Interaction Checker", desc: "Check medicine combinations for dangerous interactions before you take them." },
  { icon: <Dna size={32} className="text-indigo-500" />, title: "Genetic Risk Profiling", desc: "Factor in family history to identify hereditary disease predispositions." },
  { icon: <CloudRain size={32} className="text-amber-500" />, title: "Seasonal Disease Alerts", desc: "Location-based alerts for diseases common in your area this season." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.2) 0%, transparent 50%)"
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.3)] mb-6">
            <span className="flex items-center justify-center"><Activity size={14} className="text-[var(--color-brand)]" /></span>
            <span className="text-xs font-medium text-[var(--color-brand-light)]">Proactive Disease Monitoring System</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Health,{" "}
            <span className="gradient-text">Predicted</span>
            <br />Not Just Treated
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            NoRog uses AI to analyze your symptoms, lifestyle, and family history
            to predict health risks before they become serious. Stay one step ahead.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth" className="btn-primary text-base px-8 py-3.5">
              Get Started — Free
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-3.5">
              See Features ↓
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold gradient-text">AI-Powered</div>
            <div className="text-sm text-[var(--color-text-muted)] mt-1">Risk Analysis</div>
          </div>
          <div>
            <div className="text-3xl font-bold gradient-text">10+ Factors</div>
            <div className="text-sm text-[var(--color-text-muted)] mt-1">Analyzed per Check</div>
          </div>
          <div>
            <div className="text-3xl font-bold gradient-text">Real-Time</div>
            <div className="text-sm text-[var(--color-text-muted)] mt-1">Health Monitoring</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for <span className="gradient-text">Proactive Health</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center glass-card p-10"
          style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(16,185,129,0.1))" }}
        >
          <h2 className="text-2xl font-bold mb-4">Ready to take control of your health?</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Join NoRog and start monitoring your health proactively with AI.
          </p>
          <Link to="/auth" className="btn-primary text-base px-10 py-3.5">
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <p className="flex items-center justify-center gap-1"><ShieldAlert size={14} /> NoRog is an AI-powered health intelligence tool, not a medical diagnosis system.</p>
        <p className="mt-1">Always consult a qualified healthcare professional for medical advice.</p>
      </footer>
    </div>
  );
}
