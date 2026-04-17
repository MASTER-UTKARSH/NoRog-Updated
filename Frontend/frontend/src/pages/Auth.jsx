import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { registerUser, loginUser } from "../services/api";
import toast from "react-hot-toast";

export default function Auth() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (tab === "register") {
        res = await registerUser(form);
      } else {
        res = await loginUser({ email: form.email, password: form.password });
      }

      if (res.success) {
        login(res.data.user, res.data.token);
        toast.success(tab === "register" ? "Account created!" : "Welcome back!");
        
        if (tab === "register" || !res.data.onboardingComplete) {
          navigate("/onboarding");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                 style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-accent))" }}>
              <Activity size={24} />
            </div>
            <span className="text-2xl font-bold gradient-text">NoRog</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">Proactive Disease Monitoring System</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-[var(--color-bg-surface-alt)] rounded-lg p-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "login"
                  ? "bg-[var(--color-brand)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "register"
                  ? "bg-[var(--color-brand)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Please wait..." : (tab === "register" ? "Create Account" : "Sign In")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
