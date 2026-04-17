import { useState } from "react";
import { AlertTriangle, Siren, Info, X } from 'lucide-react';

export default function EarlyWarningBanner({ warning, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (!warning || dismissed) return null;

  const urgencyStyles = {
    monitor: {
      bg: "rgba(245, 158, 11, 0.1)",
      border: "var(--color-warning)",
      icon: <AlertTriangle size={24} className="text-[var(--color-warning)]" />
    },
    see_doctor: {
      bg: "rgba(239, 68, 68, 0.1)",
      border: "var(--color-danger)",
      icon: <Siren size={24} className="text-[var(--color-danger)]" />
    },
    none: {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "var(--color-success)",
      icon: <Info size={24} className="text-[var(--color-success)]" />
    }
  };

  const style = urgencyStyles[warning.urgency] || urgencyStyles.monitor;

  return (
    <div
      className="rounded-xl p-4 mb-4 flex items-start gap-3 animate-fade-in-up"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`
      }}
    >
      <span className="mt-0.5">{style.icon}</span>
      <div className="flex-1">
        <h4 className="font-semibold text-sm mb-1">Early Warning Alert</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">{warning.reason}</p>
      </div>
      <button
        onClick={() => { setDismissed(true); onDismiss?.(); }}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-lg"
      >
        <X size={16} />
      </button>
    </div>
  );
}
