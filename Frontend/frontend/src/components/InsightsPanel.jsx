import { useState, useEffect } from "react";
import { getAssistantInsights } from "../services/api";
import { Dna, BrainCircuit, Users, Hospital } from 'lucide-react';

export default function InsightsPanel() {
  const [data, setData] = useState({ insights: {}, family: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const { data } = await getAssistantInsights();
      setData(data);
    } catch (err) {
      console.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const { insights, family } = data;
  const hasData = family.length > 0 || (insights.mood?.length > 0) || (insights.goals?.length > 0);

  if (!hasData) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-semibold flex items-center gap-2"><Dna size={20} className="text-[var(--color-brand)]" /> AI Life Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Behavioral Traits */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
            <BrainCircuit size={16} /> User Patterns
          </h3>
          <div className="space-y-4">
            {insights.mood?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Detected Moods</p>
                <div className="flex flex-wrap gap-2">
                  {insights.mood.map((m, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--color-brand-alpha)] text-[var(--color-brand-light)] rounded-full text-xs">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {insights.goals?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Primary Goals</p>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-[var(--color-text-secondary)]">
                  {insights.goals.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}
            {insights.stress_triggers?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Stress Triggers</p>
                <div className="flex flex-wrap gap-2">
                  {insights.stress_triggers.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs border border-red-500/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Family Profiles */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
            <Users size={16} /> Family Tracking
          </h3>
          {family.length > 0 ? (
            <div className="space-y-3">
              {family.map((f, i) => (
                <div key={i} className="p-3 bg-[var(--color-bg-surface-alt)] rounded-xl border border-[var(--color-border)]">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold">{f.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{f.relation}</span>
                  </div>
                  {f.age && <p className="text-[10px] text-[var(--color-text-muted)]">{f.age} years old</p>}
                  {f.health && <p className="text-xs text-[var(--color-text-secondary)] mt-2 flex items-center gap-1"><Hospital size={12} /> {f.health}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] italic">
              Mention family members in chat to start tracking their profiles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
