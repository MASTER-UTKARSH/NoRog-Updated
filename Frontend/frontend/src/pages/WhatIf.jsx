import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Sparkles, Calendar, Flame, Wine, Moon, Activity, Utensils, Smile, Pill, AlertTriangle, PlusCircle, CheckCircle, Edit3 } from 'lucide-react';
import { runWhatIf } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";

const PRESETS = [
  { icon: <Flame size={24} />, label: "Start smoking" },
  { icon: <Wine size={24} />, label: "Drink alcohol daily" },
  { icon: <Moon size={24} />, label: "Sleep only 4 hrs/day" },
  { icon: <Activity size={24} />, label: "Exercise 5x per week" },
  { icon: <Utensils size={24} />, label: "Eat junk food daily" },
  { icon: <Smile size={24} />, label: "Start meditating daily" },
  { icon: <Pill size={24} />, label: "Stop taking my medicines" },
];

export default function WhatIf() {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

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
        setHistory(prev => [res.data, ...prev]);
        toast.success("What-If simulation complete!");
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
    const baseScore = 75; // Assume current score
    const oy = result.impact.oneMonth?.healthScoreChange || 0;
    const fy = result.impact.sixMonth?.healthScoreChange || 0;
    const ty = result.impact.oneYear?.healthScoreChange || 0;
    return [
      { year: "Now", score: baseScore },
      { year: "1 Month", score: Math.max(0, Math.min(100, baseScore + oy)) },
      { year: "6 Month", score: Math.max(0, Math.min(100, baseScore + fy)) },
      { year: "1 Year", score: Math.max(0, Math.min(100, baseScore + ty)) },
    ];
  };

  const renderTimeframe = (data, label, delay) => {
    if (!data) return null;
    return (
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-[var(--color-brand)]" />
          {label}
        </h3>

        {/* Score change badge */}
        {data.healthScoreChange !== undefined && (
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-3 ${data.healthScoreChange > 0
            ? "bg-[rgba(16,185,129,0.15)] text-[var(--color-success)]"
            : data.healthScoreChange < 0
              ? "bg-[rgba(239,68,68,0.15)] text-[var(--color-danger)]"
              : "bg-[rgba(100,116,139,0.15)] text-[var(--color-text-muted)]"
            }`}>
            {data.healthScoreChange > 0 ? "+" : ""}{data.healthScoreChange} pts
          </div>
        )}

        <p className="text-sm text-[var(--color-text-secondary)] mb-4">{data.summary}</p>

        {/* Worsening */}
        {data.worseningConditions?.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-medium text-[var(--color-danger)] flex items-center gap-1"><AlertTriangle size={12} /> Worsening:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.worseningConditions.map((c, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-[rgba(239,68,68,0.15)] text-[var(--color-danger)]">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* New risks */}
        {data.newRisks?.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-medium text-[var(--color-warning)] flex items-center gap-1"><PlusCircle size={12} /> New Risks:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.newRisks.map((r, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-[rgba(245,158,11,0.15)] text-[var(--color-warning)]">{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {data.improvements?.length > 0 && (
          <div>
            <span className="text-xs font-medium text-[var(--color-success)] flex items-center gap-1"><CheckCircle size={12} /> Improvements:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.improvements.map((m, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-[rgba(16,185,129,0.15)] text-[var(--color-success)]">{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <LoadingOverlay visible={loading} message="Running What-If simulation across 1, 5, and 10 year timelines..." />

      <div className="flex items-center gap-3">
        <Sparkles size={28} className="text-[var(--color-brand)]" />
        <h1 className="text-2xl font-bold">What-If Scenario Analyzer</h1>
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Explore how lifestyle changes could impact your health over time
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setScenario(p.label); handleAnalyze(p.label); }}
            className="glass-card p-4 text-center hover:border-[var(--color-brand)] transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{p.icon}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">{p.label}</div>
          </button>
        ))}
      </div>

      {/* Custom Scenario */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Edit3 size={16} /> Custom Scenario</h3>
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
          <h2 className="text-lg font-semibold">
            Results: "<span className="text-[var(--color-brand-light)]">{result.scenario}</span>"
          </h2>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderTimeframe(result.impact?.oneYear, "1 Month", 0)}
            {renderTimeframe(result.impact?.fiveYear, "6 Months", 0.15)}
            {renderTimeframe(result.impact?.tenYear, "1 Year", 0.3)}
          </div>

          {/* Projected Score Chart */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">Projected Health Score Trajectory</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,64,0.5)" />
                  <XAxis dataKey="year" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-brand)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-brand)", r: 6, strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
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
