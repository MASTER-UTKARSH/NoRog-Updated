import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, TrendingDown, CloudRain, Lightbulb, FileText, Bot, Sparkles, AlertTriangle, Activity, ChevronRight, Calendar } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { useAuth } from "../context/AuthContext";
import { getProfile, getSymptomHistory, checkSeasonal } from "../services/api";
import HealthScoreCircle from "../components/HealthScoreCircle";
import EarlyWarningBanner from "../components/EarlyWarningBanner";
import RiskCard from "../components/RiskCard";
import InsightsPanel from "../components/InsightsPanel";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [seasonal, setSeasonal] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        getProfile(),
        getSymptomHistory()
      ]);

      if (profileRes.success) {
        setProfile(profileRes.data.profile);
        if (!profileRes.data.profile?.onboardingComplete) {
          navigate("/onboarding");
          return;
        }
      }

      if (historyRes.success) {
        const logs = Array.isArray(historyRes.data) ? historyRes.data : [];
        setRecentLogs(logs);
        const warned = logs.find(l => l.warningFlagged);
        if (warned && warned.warningReason) {
          setWarning({ reason: warned.warningReason, urgency: warned.warningUrgency || "monitor" });
        }
      }

      try {
        const cached = localStorage.getItem("norog_predictions");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setPredictions(parsed);
            if (parsed.length > 0) setLatestPrediction(parsed[0]);
          }
        }
      } catch {}

      try {
        const seasonalRes = await checkSeasonal();
        if (seasonalRes.success && seasonalRes.data?.alert) {
          setSeasonal(seasonalRes.data);
        }
      } catch {}

    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const score = latestPrediction?.healthScore || 75;
  const trend = latestPrediction?.trend || "stable";
  const trendConfig = {
    improving: { icon: <TrendingUp size={14} />, label: "Improving", color: "var(--color-success)" },
    stable: { icon: <ArrowRight size={14} />, label: "Stable", color: "var(--color-text-muted)" },
    declining: { icon: <TrendingDown size={14} />, label: "Declining", color: "var(--color-danger)" },
  };

  const sparkData = predictions.slice(0, 7).reverse().map((p, i) => ({
    score: p.healthScore || 75,
    name: `#${i + 1}`
  }));
  if (sparkData.length === 0) sparkData.push({ score: 75, name: "#1" });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 space-y-6 animate-fade-in py-6">
      {/* ── Header ── */}
      <div>
        <p className="text-sm text-[var(--color-text-muted)] font-medium">{greeting()}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)] mt-0.5">
          {user?.name?.split(" ")[0] || "User"}
        </h1>
      </div>

      {/* ── Warnings ── */}
      {warning && <EarlyWarningBanner warning={warning} onDismiss={() => setWarning(null)} />}

      {/* ── Seasonal Alert ── */}
      {seasonal?.alert && (
        <div className="card-elevated p-4 flex items-start gap-3 animate-fade-in-up"
          style={{ borderLeft: "3px solid var(--color-warning)" }}>
          <CloudRain size={20} className="text-[var(--color-warning)] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-[var(--color-text)] mb-0.5">Seasonal Alert</h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{seasonal.alert}</p>
            {seasonal.recommendation && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 flex items-center gap-1">
                <Lightbulb size={11} /> {seasonal.recommendation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Top Metrics Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Health Score Card */}
        <div className="md:col-span-4 card-elevated p-6 flex flex-col items-center justify-center">
          <HealthScoreCircle score={score} size={160} />
          <div className="flex items-center gap-1.5 mt-3">
            <span className="flex items-center" style={{ color: trendConfig[trend].color }}>
              {trendConfig[trend].icon}
            </span>
            <span className="text-xs font-semibold" style={{ color: trendConfig[trend].color }}>
              {trendConfig[trend].label}
            </span>
          </div>
          {!latestPrediction && (
            <button onClick={() => navigate("/analysis")} className="btn-primary text-xs mt-4 py-2 px-4">
              Run First Analysis
            </button>
          )}
        </div>

        {/* Score Trend Chart */}
        <div className="md:col-span-5 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="metric-label">Health trend</p>
              <p className="text-xl font-bold tracking-tight text-[var(--color-text)] mt-0.5">{score}/100</p>
            </div>
            <div className="badge badge-brand">Last 7 checks</div>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <XAxis dataKey="name" hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                  }}
                  formatter={(value) => [`${value}`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-brand)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--color-brand)", r: 3.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {latestPrediction?.summary && (
            <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed line-clamp-2">
              {latestPrediction.summary}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-3 flex flex-col gap-2.5">
          <button
            onClick={() => navigate("/symptoms")}
            className="card-elevated p-4 text-left group hover:border-[var(--color-brand)] transition-all flex-1 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-alpha)] text-[var(--color-brand)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)]">Log Symptoms</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Track how you feel</p>
            </div>
            <ChevronRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate("/analysis")}
            className="card-elevated p-4 text-left group hover:border-[var(--color-accent)] transition-all flex-1 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-alpha)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)]">AI Analysis</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Run predictions</p>
            </div>
            <ChevronRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate("/whatif")}
            className="card-elevated p-4 text-left group hover:border-[var(--color-accent)] transition-all flex-1 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)]">What-If</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Explore scenarios</p>
            </div>
            <ChevronRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* ── Risk Factors ── */}
      {latestPrediction?.risks?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--color-warning)]" />
              Risk Factors
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {latestPrediction.risks.slice(0, 4).map((risk, i) => (
              <RiskCard key={i} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Symptom Logs ── */}
      {recentLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title flex items-center gap-2">
              <Calendar size={16} className="text-[var(--color-brand)]" />
              Recent Logs
            </h2>
            <button onClick={() => navigate("/history")} className="text-xs font-semibold text-[var(--color-brand)] hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentLogs.slice(0, 3).map((log, i) => (
              <div key={i} className="card-elevated p-4 flex items-center gap-4">
                <div className="text-xs font-medium text-[var(--color-text-muted)] w-20 flex-shrink-0">
                  {(() => { try { return new Date(log.createdAt || log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }); } catch { return "Unknown"; } })()}
                </div>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {(Array.isArray(log.symptoms) ? log.symptoms : []).map((s, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded-md bg-[var(--color-bg-surface-alt)] text-[var(--color-text-secondary)] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="severity-bar w-14">
                    <div className="severity-bar-fill" style={{
                      width: `${log.severity * 10}%`,
                      background: log.severity > 7 ? "var(--color-danger)" : log.severity > 4 ? "var(--color-warning)" : "var(--color-success)"
                    }} />
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] font-semibold tabular-nums w-8">{log.severity}/10</span>
                </div>
                {log.warningFlagged && <AlertTriangle size={14} className="text-[var(--color-danger)] flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Insights ── */}
      <InsightsPanel />
    </div>
  );
}
