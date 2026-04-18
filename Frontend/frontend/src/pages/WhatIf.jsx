import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Sparkles, Calendar, Flame, Wine, Moon, Activity, Utensils, Smile, Pill, AlertTriangle, PlusCircle, CheckCircle, Edit3, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { runWhatIf } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";

const PRESETS = [
  { icon: <Flame size={18} />, label: "Start smoking", type: "risk" },
  { icon: <Wine size={18} />, label: "Drink alcohol daily", type: "risk" },
  { icon: <Moon size={18} />, label: "Sleep only 4 hrs/day", type: "risk" },
  { icon: <Utensils size={18} />, label: "Eat junk food daily", type: "risk" },
  { icon: <Activity size={18} />, label: "Exercise 5x per week", type: "benefit" },
  { icon: <Smile size={18} />, label: "Start meditating daily", type: "benefit" },
  { icon: <Pill size={18} />, label: "Stop taking my medicines", type: "risk" },
];

export default function WhatIf() {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (s) => {
    const text = (s || scenario || "").trim();
    if (!text) { toast.error("Enter a valid scenario first"); return; }
    if (text.length > 500) { toast.error("Scenario is too long (max 500 characters)"); return; }
    setLoading(true);
    try {
      const res = await runWhatIf(text);
      if (res.success) { setResult(res.data); toast.success("Simulation complete!"); }
    } catch (err) {
      toast.error(err.response?.data?.error || "Simulation failed");
    } finally { setLoading(false); }
  };

  const getChartData = () => {
    if (!result?.impact) return [];
    const base = 75;
    const m1 = result.impact.oneMonth?.healthScoreChange || 0;
    const m6 = result.impact.sixMonth?.healthScoreChange || 0;
    const y1 = result.impact.oneYear?.healthScoreChange || 0;
    return [
      { period: "Now", score: base },
      { period: "1 Month", score: Math.max(0, Math.min(100, base + m1)) },
      { period: "6 Months", score: Math.max(0, Math.min(100, base + m6)) },
      { period: "1 Year", score: Math.max(0, Math.min(100, base + y1)) },
    ];
  };

  const getScoreColor = (c) => c > 0 ? "var(--color-success)" : c < 0 ? "var(--color-danger)" : "var(--color-text-muted)";
  const getScoreIcon = (c) => c > 0 ? <TrendingUp size={13} /> : c < 0 ? <TrendingDown size={13} /> : <Minus size={13} />;

  const renderTimeframe = (data, label, delay) => {
    if (!data) return null;
    const change = data.healthScoreChange || 0;
    return (
      <div className="card-elevated p-5 animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
            <Calendar size={14} className="text-[var(--color-text-muted)]" />
            {label}
          </h3>
          <div className="badge" style={{
            background: change > 0 ? "var(--color-success-alpha)" : change < 0 ? "var(--color-danger-alpha)" : "var(--color-bg-surface-alt)",
            color: getScoreColor(change)
          }}>
            {getScoreIcon(change)}
            {change > 0 ? "+" : ""}{change} pts
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">{data.summary}</p>

        {data.worseningConditions?.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-danger)] flex items-center gap-1 mb-1.5">
              <AlertTriangle size={10} /> Worsening
            </span>
            <div className="flex flex-wrap gap-1">
              {data.worseningConditions.map((c, i) => (
                <span key={i} className="badge badge-danger text-[10px]">{c}</span>
              ))}
            </div>
          </div>
        )}

        {data.newRisks?.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-warning)] flex items-center gap-1 mb-1.5">
              <PlusCircle size={10} /> New Risks
            </span>
            <div className="flex flex-wrap gap-1">
              {data.newRisks.map((r, i) => (
                <span key={i} className="badge badge-warning text-[10px]">{r}</span>
              ))}
            </div>
          </div>
        )}

        {data.improvements?.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-success)] flex items-center gap-1 mb-1.5">
              <CheckCircle size={10} /> Improvements
            </span>
            <div className="flex flex-wrap gap-1">
              {data.improvements.map((m, i) => (
                <span key={i} className="badge badge-success text-[10px]">{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 space-y-6 animate-fade-in py-6">
      <LoadingOverlay visible={loading} message="Running What-If simulation across 1 month, 6 month, and 1 year timelines..." />

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-[var(--color-accent)] flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[var(--color-text)]">What-If Simulator</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Explore how lifestyle changes could impact your health</p>
          </div>
        </div>
      </div>

      {/* ── Preset Scenarios ── */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">Quick scenarios</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setScenario(p.label); handleAnalyze(p.label); }}
              className="card-soft p-3.5 text-left flex items-center gap-2.5 group cursor-pointer hover:border-[var(--color-border-light)]"
            >
              <span className={`flex-shrink-0 ${p.type === "risk" ? "text-[var(--color-danger-light)]" : "text-[var(--color-success-light)]"} group-hover:scale-110 transition-transform`}>
                {p.icon}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-secondary)] leading-tight">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom Scenario ── */}
      <div className="card-elevated p-5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5">
          <Edit3 size={12} /> Custom Scenario
        </label>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="e.g., Start swimming 3x per week and quit sugar"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            maxLength={500}
          />
          <button onClick={() => handleAnalyze()} className="btn-primary px-5" disabled={loading}>
            Analyze <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Scenario Title */}
          <div className="card-elevated p-4 flex items-center gap-2.5">
            <Sparkles size={16} className="text-[var(--color-accent)] flex-shrink-0" />
            <p className="text-sm font-medium text-[var(--color-text)]">
              Results for: <span className="text-[var(--color-accent)] font-bold">"{result.scenario}"</span>
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {renderTimeframe(result.impact?.oneMonth, "1 Month", 0)}
            {renderTimeframe(result.impact?.sixMonth, "6 Months", 0.08)}
            {renderTimeframe(result.impact?.oneYear, "1 Year", 0.16)}
          </div>

          {/* Projected Score Chart */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="section-title">Health Score Trajectory</p>
              <div className="badge badge-brand">Projected</div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="period" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} width={32} />
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
                    dot={{ fill: "var(--color-brand)", r: 4, strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
