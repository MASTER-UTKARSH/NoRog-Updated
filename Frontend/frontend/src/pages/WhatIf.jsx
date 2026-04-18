import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Sparkles, Calendar, Flame, Wine, Moon, Activity, Utensils, Smile, Pill, AlertTriangle, PlusCircle, CheckCircle, Edit3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { runWhatIf } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";

const PRESETS = [
  { icon: <Flame size={20} />, label: "Start smoking", color: "var(--color-danger)" },
  { icon: <Wine size={20} />, label: "Drink alcohol daily", color: "var(--color-warning)" },
  { icon: <Moon size={20} />, label: "Sleep only 4 hrs/day", color: "var(--color-warning)" },
  { icon: <Activity size={20} />, label: "Exercise 5x per week", color: "var(--color-success)" },
  { icon: <Utensils size={20} />, label: "Eat junk food daily", color: "var(--color-danger)" },
  { icon: <Smile size={20} />, label: "Start meditating daily", color: "var(--color-success)" },
  { icon: <Pill size={20} />, label: "Stop taking my medicines", color: "var(--color-danger)" },
];

export default function WhatIf() {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (s) => {
    const text = s || scenario;
    if (!text.trim()) {
      toast.error("Enter a scenario first");
      return;
    }
    setLoading(true);
    try {
      const res = await runWhatIf(text);
      if (res.success) {
        setResult(res.data);
        toast.success("Simulation complete!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  // Build projected health score chart data
  const getChartData = () => {
    if (!result?.impact) return [];
    const baseScore = 75;
    const m1 = result.impact.oneMonth?.healthScoreChange || 0;
    const m6 = result.impact.sixMonth?.healthScoreChange || 0;
    const y1 = result.impact.oneYear?.healthScoreChange || 0;
    return [
      { period: "Now", score: baseScore },
      { period: "1 Month", score: Math.max(0, Math.min(100, baseScore + m1)) },
      { period: "6 Months", score: Math.max(0, Math.min(100, baseScore + m6)) },
      { period: "1 Year", score: Math.max(0, Math.min(100, baseScore + y1)) },
    ];
  };

  const getScoreColor = (change) => {
    if (change > 0) return "var(--color-success)";
    if (change < 0) return "var(--color-danger)";
    return "var(--color-text-muted)";
  };

  const getScoreIcon = (change) => {
    if (change > 0) return <TrendingUp size={14} />;
    if (change < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const renderTimeframe = (data, label, periodIcon, delay) => {
    if (!data) return null;
    const change = data.healthScoreChange || 0;
    return (
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--color-text)]">
            <Calendar size={16} className="text-[var(--color-brand)]" />
            {label}
          </h3>
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: change > 0 ? "rgba(16,185,129,0.12)" : change < 0 ? "rgba(239,68,68,0.12)" : "rgba(100,116,139,0.12)",
              color: getScoreColor(change)
            }}
          >
            {getScoreIcon(change)}
            {change > 0 ? "+" : ""}{change} pts
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">{data.summary}</p>

        {/* Worsening */}
        {data.worseningConditions?.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-medium text-[var(--color-danger)] flex items-center gap-1 mb-1.5">
              <AlertTriangle size={12} /> Worsening
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.worseningConditions.map((c, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-danger)" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* New Risks */}
        {data.newRisks?.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-medium text-[var(--color-warning)] flex items-center gap-1 mb-1.5">
              <PlusCircle size={12} /> New Risks
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.newRisks.map((r, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "var(--color-warning)" }}>{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {data.improvements?.length > 0 && (
          <div>
            <span className="text-xs font-medium text-[var(--color-success)] flex items-center gap-1 mb-1.5">
              <CheckCircle size={12} /> Improvements
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.improvements.map((m, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <LoadingOverlay visible={loading} message="Running What-If simulation across 1 month, 6 month, and 1 year timelines..." />

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Sparkles size={28} className="text-[var(--color-brand)]" />
          <h1 className="text-2xl font-bold">What-If Scenario Analyzer</h1>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Explore how lifestyle changes could impact your health over time
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setScenario(p.label); handleAnalyze(p.label); }}
            className="glass-card p-4 text-center hover:border-[var(--color-brand)] transition-all group cursor-pointer"
          >
            <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform" style={{ color: p.color }}>
              {p.icon}
            </div>
            <div className="text-xs font-medium text-[var(--color-text-secondary)]">{p.label}</div>
          </button>
        ))}
      </div>

      {/* Custom Scenario */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Edit3 size={16} className="text-[var(--color-brand)]" /> Custom Scenario
        </h3>
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="e.g., 'Start swimming 3x per week and quit sugar'"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <button onClick={() => handleAnalyze()} className="btn-primary px-6" disabled={loading}>
            Analyze
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="glass-card p-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-brand)]" />
              Results for: "<span className="text-[var(--color-brand-light)]">{result.scenario}</span>"
            </h2>
          </div>

          {/* Timeline Cards — 1 Month / 6 Months / 1 Year */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderTimeframe(result.impact?.oneMonth, "1 Month", null, 0)}
            {renderTimeframe(result.impact?.sixMonth, "6 Months", null, 0.1)}
            {renderTimeframe(result.impact?.oneYear, "1 Year", null, 0.2)}
          </div>

          {/* Projected Score Chart */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">Projected Health Score Trajectory</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="period" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-brand)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-brand)", r: 5, strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
