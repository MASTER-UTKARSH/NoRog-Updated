import { useState } from "react";
import { downloadReport } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";

export default function DoctorReport() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await downloadReport();
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `HealthReport_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to generate report. Make sure you have health data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <LoadingOverlay visible={loading} message="📄 Generating your comprehensive health report..." />

      <div>
        <h1 className="text-2xl font-bold">📄 Doctor Report</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Generate a comprehensive PDF report to share with your doctor</p>
      </div>

      <div className="glass-card p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-semibold mb-3">Health Report Generator</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
          This report includes your patient summary, medical history, lifestyle data,
          symptom history, AI risk assessments, and medicine interactions.
        </p>

        {/* Report Sections Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left">
          {[
            { icon: "👤", title: "Patient Summary", desc: "Name, age, gender, location" },
            { icon: "🏥", title: "Medical History", desc: "Conditions, family history, lifestyle" },
            { icon: "📊", title: "Symptom History", desc: "Last 30 symptom log entries" },
            { icon: "🤖", title: "AI Risk Assessment", desc: "Disease risks with confidence scores" },
            { icon: "💊", title: "Medicine Interactions", desc: "Any flagged drug interactions" },
            { icon: "⚠️", title: "Disclaimer", desc: "AI-generated, not a diagnosis" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-surface-alt)]">
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleDownload} className="btn-primary px-10 py-3.5 text-base" disabled={loading}>
          📥 Generate & Download PDF
        </button>

        <p className="text-xs text-[var(--color-text-muted)] mt-4">
          ⚠️ This report is AI-generated for informational purposes only.<br />
          It is not a medical diagnosis. Please consult a licensed physician.
        </p>
      </div>
    </div>
  );
}
