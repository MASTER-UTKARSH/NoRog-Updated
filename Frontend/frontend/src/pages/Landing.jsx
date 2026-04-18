import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Activity, ArrowRight, Shield, Zap, BarChart3, Pill, HeartPulse, Dna, Brain, ChevronRight } from 'lucide-react';

const FEATURES = [
  {
    icon: <Brain size={22} />,
    title: "AI Risk Prediction",
    desc: "Our model analyzes 10+ health factors to catch risks early.",
    color: "#2563EB"
  },
  {
    icon: <BarChart3 size={22} />,
    title: "What-If Simulator",
    desc: "See how lifestyle changes affect your health over 1 month to 1 year.",
    color: "#7C3AED"
  },
  {
    icon: <Pill size={22} />,
    title: "Drug Interaction Checker",
    desc: "Instantly check medicine combos for dangerous interactions.",
    color: "#DC2626"
  },
  {
    icon: <Dna size={22} />,
    title: "Genetic Risk Profiling",
    desc: "Factor in family history for hereditary disease detection.",
    color: "#059669"
  },
  {
    icon: <HeartPulse size={22} />,
    title: "Symptom Tracking",
    desc: "Log and monitor symptoms over time with intelligent severity tracking.",
    color: "#D97706"
  },
  {
    icon: <Shield size={22} />,
    title: "Seasonal Alerts",
    desc: "Location-aware alerts for diseases common in your area this season.",
    color: "#0891B2"
  },
];

const STATS = [
  { value: "10+", label: "Health factors analyzed" },
  { value: "AI", label: "Powered predictions" },
  { value: "24/7", label: "Health monitoring" },
];

export default function Landing() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)]">
      {/* ── Navigation Bar ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)]" style={{ background: "rgba(250,251,252,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Noरोग Logo" className="w-8 h-8 object-contain rounded-md" />
            <span className="text-[17px] font-bold text-[var(--color-text)]">Noरोग</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors px-3 py-1.5">Features</a>
            <Link to="/auth" className="btn-primary text-sm py-2 px-5">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }}
        />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }}
        />

        <div className="relative max-w-3xl mx-auto text-center px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-alpha)] border border-[var(--color-brand-lighter)] mb-6">
              <Zap size={12} className="text-[var(--color-brand)]" />
              <span className="text-xs font-semibold text-[var(--color-brand)]">Proactive Health Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold leading-[1.1] tracking-tight text-[var(--color-text)] mb-5">
              Predict health risks
              <br />
              <span className="gradient-text">before they strike</span>
            </h1>

            <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto mb-8">
              Noरोग uses AI to analyze your symptoms, lifestyle, and genetics
              to predict disease risks — so you can act early, not react late.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/auth" className="btn-primary text-[15px] px-7 py-3">
                Start Free <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-secondary text-[15px] px-7 py-3">
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">{s.value}</div>
              <div className="text-xs md:text-sm text-[var(--color-text-muted)] mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Everything for proactive health
          </h2>
          <p className="text-sm md:text-base text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">
            Six powerful tools that work together to keep you ahead of health risks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group glass-card p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${f.color}10`, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-1.5">{f.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16 md:pb-24">
        <div className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-accent))" }}
        >
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)"
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
              Take control of your health today
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-6 max-w-md mx-auto">
              Join Noरोग and start monitoring your health proactively — completely free.
            </p>
            <Link to="/auth" className="inline-flex items-center gap-2 bg-white text-[var(--color-brand)] font-bold text-[15px] px-7 py-3 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5">
              Create Account <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Noरोग Logo" className="w-5 h-5 object-contain rounded-sm" />
            <span className="text-sm font-bold text-[var(--color-text)]">Noरोग</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            AI-powered health intelligence tool — not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
