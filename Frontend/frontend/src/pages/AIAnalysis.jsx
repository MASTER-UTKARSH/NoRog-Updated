import { useState } from "react";
import { runPrediction } from "../services/api";
import { Bot, Dna, TrendingUp, TrendingDown, ArrowRight, CloudRain } from 'lucide-react';
import HealthScoreCircle from "../components/HealthScoreCircle";
import RiskCard from "../components/RiskCard";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";

export default function AIAnalysis() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await runPrediction();
      if (res.success) {
        setPrediction(res.data);
        // Cache predictions
        try {
          const existing = JSON.parse(localStorage.getItem("norog_predictions") || "[]");
          const updated = [res.data, ...existing].slice(0, 10);
          localStorage.setItem("norog_predictions", JSON.stringify(updated));
        } catch {}
        toast.success("Analysis complete!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <LoadingOverlay visible={loading} message="Analyzing your health data and checking genetic risk factors..." />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot size={28} className="text-[var(--color-brand)]" />
          <div>
            <h1 className="text-2xl font-bold">AI Risk Analysis</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Get a comprehensive disease risk assessment based on all your data</p>
          </div>
        </div>
        <button onClick={handlePredict} className="btn-primary" disabled={loading}>
          {prediction ? "Re-Analyze" : "Run Analysis"}
        </button>
      </div>

      {!prediction && !loading && (
        <div className="glass-card p-12 text-center">
          <div className="flex justify-center mb-4 text-[var(--color-brand)]"><Dna size={48} /></div>
          <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Click "Run Analysis" to get your AI-powered health risk assessment.<br />
            Make sure you've completed your health profile and logged symptoms for best results.
          </p>
          <button onClick={handlePredict} className="btn-primary">
            Run First Analysis
          </button>
        </div>
      )}

      {prediction && (
        <>
          {/* Top: Score + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 flex flex-col items-center">
              <HealthScoreCircle score={prediction.healthScore || 75} size={200} />
              <div className="mt-3 flex items-center gap-2">
                <span className="flex items-center justify-center">
                  {prediction.trend === "improving" ? <TrendingUp size={24} className="text-[var(--color-success)]" /> : prediction.trend === "declining" ? <TrendingDown size={24} className="text-[var(--color-danger)]" /> : <ArrowRight size={24} className="text-[var(--color-text-muted)]" />}
                </span>
                <span className="text-sm capitalize text-[var(--color-text-secondary)]">
                  Trend: {prediction.trend || "stable"}
                </span>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">AI Summary</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {prediction.summary || "No summary available."}
              </p>

              {prediction.seasonalAlert && (
                <div className="mt-4 p-3 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[var(--color-warning)]">
                  <span className="text-xs font-medium text-[var(--color-warning)] flex items-center gap-1"><CloudRain size={12} /> Seasonal Alert:</span>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">{prediction.seasonalAlert}</p>
                </div>
              )}

              <div className="mt-4 text-xs text-[var(--color-text-muted)]">
                Analyzed on {new Date(prediction.createdAt || prediction.date).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Risk Cards */}
          {prediction.risks?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Disease Risk Assessment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prediction.risks.map((risk, i) => (
                  <RiskCard key={i} risk={risk} />
                ))}
              </div>
            </div>
          )}

          {/* Correlations */}
          {prediction.correlations?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Symptom Correlations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prediction.correlations.map((corr, i) => (
                  <div key={i} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {corr.symptoms?.map((s, j) => (
                        <span key={j} className="text-xs px-2 py-1 rounded-full bg-[rgba(37,99,235,0.15)] text-[var(--color-brand-light)]">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-text-muted)]">→</span>
                      <span className="text-sm font-medium text-[var(--color-warning)]">{corr.possibleCondition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
