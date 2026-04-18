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

  const validate = () => {
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email) {
      toast.error("Email is required");
      return false;
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (password.length > 128) {
      toast.error("Password is too long");
      return false;
    }

    if (tab === "register") {
      const name = form.name.trim();
      if (!name) {
        toast.error("Name is required");
        return false;
      }
      if (name.length < 2) {
        toast.error("Name must be at least 2 characters");
        return false;
      }
      if (name.length > 50) {
        toast.error("Name must be under 50 characters");
        return false;
      }
      if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
        toast.error("Name can only contain letters, spaces, dots, hyphens, and apostrophes");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const cleanName = form.name.trim();

      let res;
      if (tab === "register") {
        res = await registerUser({ name: cleanName, email: cleanEmail, password: form.password });
      } else {
        res = await loginUser({ email: cleanEmail, password: form.password });
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg-body)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Noरोग Logo" className="w-10 h-10 object-contain rounded-xl shadow-sm" />
            <span className="text-xl font-extrabold text-[var(--color-text)]">Noरोग</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">Preventive Health Intelligence</p>
        </div>

        {/* Card */}
        <div className="card-elevated p-7">
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
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={50}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Email</label>
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
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                maxLength={128}
              />
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Minimum 6 characters</p>
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
