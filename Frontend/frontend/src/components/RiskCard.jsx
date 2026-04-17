import { Dna } from 'lucide-react';

export default function RiskCard({ risk }) {
  const level = risk.confidence > 60 ? "high" : risk.confidence > 30 ? "moderate" : "low";
  const levelColors = {
    low: { bg: "rgba(16, 185, 129, 0.1)", border: "var(--color-success)", text: "var(--color-success)" },
    moderate: { bg: "rgba(245, 158, 11, 0.1)", border: "var(--color-warning)", text: "var(--color-warning)" },
    high: { bg: "rgba(239, 68, 68, 0.1)", border: "var(--color-danger)", text: "var(--color-danger)" }
  };
  const colors = levelColors[level];

  const urgencyColors = {
    "Monitor": "bg-[rgba(16,185,129,0.2)] text-[var(--color-success)]",
    "See doctor soon": "bg-[rgba(245,158,11,0.2)] text-[var(--color-warning)]",
    "Seek immediate care": "bg-[rgba(239,68,68,0.2)] text-[var(--color-danger)]"
  };

  return (
    <div
      className={`glass-card p-5 risk-${level} animate-fade-in-up`}
      style={{ borderLeftColor: colors.border }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold">{risk.disease}</h3>
        <div className="flex items-center gap-2">
          {risk.geneticFactor && (
            <span className="text-xs px-2 py-1 rounded-full bg-[rgba(139,92,246,0.2)] text-[#a78bfa] flex items-center gap-1">
              <Dna size={12} /> Genetic
            </span>
          )}
          <span
            className="text-lg font-bold"
            style={{ color: colors.text }}
          >
            {risk.confidence}%
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="severity-bar mb-3">
        <div
          className="severity-bar-fill"
          style={{
            width: `${risk.confidence}%`,
            background: `linear-gradient(90deg, ${colors.border}, ${colors.text})`
          }}
        />
      </div>

      {/* Contributing symptoms */}
      {risk.contributingSymptoms?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {risk.contributingSymptoms.map((s, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-surface-alt)] text-[var(--color-text-secondary)]">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Urgency badge */}
      {risk.urgency && (
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${urgencyColors[risk.urgency] || ""}`}>
          {risk.urgency}
        </span>
      )}
    </div>
  );
}
