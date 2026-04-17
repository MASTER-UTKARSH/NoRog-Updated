import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, TrendingDown, CloudRain, Lightbulb, FileText, Bot, Sparkles, AlertTriangle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from "recharts";
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
        
        // Check for warnings
        const warned = logs.find(l => l.warningFlagged);
        if (warned && warned.warningReason) {
          setWarning({ reason: warned.warningReason, urgency: warned.warningUrgency || "monitor" });
        }
      }

      // Try to get latest predictions from local storage cache
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

      // Seasonal check (background)
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

  const trendIcon = { 
    improving: <TrendingUp size={16} className="text-success" />, 
    stable: <ArrowRight size={16} className="text-text-muted" />, 
    declining: <TrendingDown size={16} className="text-danger" /> 
  };
  const trendText = { improving: "Improving", stable: "Stable", declining: "Declining" };

  // Sparkline data from predictions
  const sparkData = predictions.slice(0, 7).reverse().map((p, i) => ({
    score: p.healthScore || 75
  }));
  if (sparkData.length === 0) sparkData.push({ score: 75 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0] || "User"}</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Here's your health overview</p>
      </div>

      {/* Warnings */}
      {warning && <EarlyWarningBanner warning={warning} onDismiss={() => setWarning(null)} />}

      {/* Seasonal Alert */}
      {seasonal?.alert && (
        <div className="rounded-xl p-4 mb-2 flex items-start gap-3 animate-fade-in-up"
          style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--color-warning)" }}>
          <CloudRain size={24} className="text-[var(--color-warning)]" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Seasonal Alert</h4>
            <p className="text-sm text-[var(--color-text-secondary)]">{seasonal.alert}</p>
            {seasonal.recommendation && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1"><Lightbulb size={12} /> {seasonal.recommendation}</p>
            )}
          </div>
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="glass-card p-6 flex flex-col items-center">
          <HealthScoreCircle score={latestPrediction?.healthScore || 75} />
          <div className="mt-3 flex items-center gap-2">
            <span className="flex items-center justify-center">{trendIcon[latestPrediction?.trend || "stable"]}</span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {trendText[latestPrediction?.trend || "stable"]}
            </span>
          </div>
          {!latestPrediction && (
            <button onClick={() => navigate("/analysis")} className="btn-primary text-xs mt-3 px-4 py-2">
              Run First Analysis
            </button>
          )}
        </div>

        {/* Score Trend Sparkline */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">Score Trend (Last 7)</h3>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="score" stroke="var(--color-brand)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {latestPrediction?.summary && (
            <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">
              {latestPrediction.summary}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Quick Actions</h3>
          <button onClick={() => navigate("/symptoms")} className="btn-primary text-sm py-2.5 w-full flex items-center justify-center gap-2">
            <FileText size={16} /> Log Symptoms
          </button>
          <button onClick={() => navigate("/analysis")} className="btn-secondary text-sm py-2.5 w-full flex items-center justify-center gap-2">
            <Bot size={16} /> Run AI Analysis
          </button>
          <button onClick={() => navigate("/whatif")} className="btn-secondary text-sm py-2.5 w-full flex items-center justify-center gap-2">
            <Sparkles size={16} /> What-If Scenarios
          </button>
        </div>
      </div>

      {/* Risk Summary */}
      {latestPrediction?.risks?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Top Risk Factors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestPrediction.risks.slice(0, 4).map((risk, i) => (
              <RiskCard key={i} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Symptom Logs</h2>
            <button onClick={() => navigate("/history")} className="text-xs text-[var(--color-brand-light)] hover:underline">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentLogs.slice(0, 3).map((log, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-4">
                <div className="text-xs text-[var(--color-text-muted)] w-20 flex-shrink-0">
                  {new Date(log.createdAt || log.date).toLocaleDateString()}
                </div>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {log.symptoms.map((s, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-surface-alt)] text-[var(--color-text-secondary)]">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="severity-bar w-16">
                    <div className="severity-bar-fill" style={{
                      width: `${log.severity * 10}%`,
                      background: log.severity > 7 ? "var(--color-danger)" : log.severity > 4 ? "var(--color-warning)" : "var(--color-success)"
                    }} />
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{log.severity}/10</span>
                </div>
                {log.warningFlagged && <AlertTriangle size={14} className="text-[var(--color-danger)]" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Life Insights */}
      <InsightsPanel />
    </div>
  );
}
