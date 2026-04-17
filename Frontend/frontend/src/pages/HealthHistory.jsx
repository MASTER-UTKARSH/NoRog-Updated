import { useState, useEffect } from "react";
import { getSymptomHistory } from "../services/api";
import toast from "react-hot-toast";
import { FolderClock, Inbox, Calendar, AlertTriangle, Thermometer, Camera } from 'lucide-react';

const FILTERS = ["All", "Symptom Logs", "Warnings"];

export default function HealthHistory() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await getSymptomHistory();
      if (res.success) setLogs(res.data);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "All") return true;
    if (filter === "Warnings") return log.warningFlagged;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3">
          <FolderClock size={28} className="text-[var(--color-brand)]" />
          <h1 className="text-2xl font-bold">Health History</h1>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Your complete health timeline</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-[var(--color-brand)] text-white"
                : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-brand)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="flex justify-center mb-4 text-[var(--color-text-muted)]"><Inbox size={48} /></div>
          <h3 className="text-lg font-semibold mb-2">No entries yet</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Start logging symptoms to build your health timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log, i) => (
            <div key={i} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-[var(--color-brand)]"><Calendar size={18} /></div>
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short", year: "numeric", month: "short", day: "numeric"
                      })}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {new Date(log.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.warningFlagged && (
                    <span className="text-xs px-2 py-1 rounded-full bg-[rgba(239,68,68,0.15)] text-[var(--color-danger)] flex items-center gap-1">
                      <AlertTriangle size={12} /> Warning
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="severity-bar w-16">
                      <div className="severity-bar-fill" style={{
                        width: `${log.severity * 10}%`,
                        background: log.severity > 7 ? "var(--color-danger)" : log.severity > 4 ? "var(--color-warning)" : "var(--color-success)"
                      }} />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">{log.severity}/10</span>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {log.symptoms.map((s, j) => (
                  <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-surface-alt)] text-[var(--color-text-secondary)] flex items-center gap-1">
                    <Thermometer size={12} /> {s}
                  </span>
                ))}
              </div>

              {/* Notes */}
              {log.notes && (
                <p className="text-sm text-[var(--color-text-muted)] mt-2 italic">"{log.notes}"</p>
              )}

              {/* Photo AI Description */}
              {log.photoAIDescription && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--color-bg-surface-alt)] border border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-brand-light)] flex items-center gap-1"><Camera size={12} /> AI Photo Analysis:</span>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">{log.photoAIDescription}</p>
                </div>
              )}

              {/* Warning reason */}
              {log.warningFlagged && log.warningReason && (
                <div className="mt-3 p-3 rounded-lg bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)]">
                  <span className="text-xs font-medium text-[var(--color-danger)] flex items-center gap-1"><AlertTriangle size={12} /> Warning:</span>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">{log.warningReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
