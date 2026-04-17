import { useState } from "react";
import { downloadReport } from "../services/api";
import { FileText, User, Hospital, Activity, Bot, Pill, AlertTriangle, Download } from 'lucide-react';
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
      <LoadingOverlay visible={loading} message="Generating your comprehensive health report..." />

      <div className="flex items-center gap-3">
        <FileText size={28} className="text-[var(--color-brand)]" />
        <h1 className="text-2xl font-bold">Doctor Report</h1>
      </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Generate a comprehensive PDF report to share with your doctor</p>
      </div>

      <div className="glass-card p-8 text-center">
        <div className="flex justify-center mb-4 text-[var(--color-brand)]"><FileText size={64} /></div>
        <h2 className="text-xl font-semibold mb-3">Health Report Generator</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
          This report includes your patient summary, medical history, lifestyle data,
          symptom history, AI risk assessments, and medicine interactions.
        </p>

        {/* Report Sections Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left">
          {[
            { icon: <User size={20} className="text-indigo-500" />, title: "Patient Summary", desc: "Name, age, gender, location" },
            { icon: <Hospital size={20} className="text-emerald-500" />, title: "Medical History", desc: "Conditions, family history, lifestyle" },
            { icon: <Activity size={20} className="text-blue-500" />, title: "Symptom History", desc: "Last 30 symptom log entries" },
            { icon: <Bot size={20} className="text-purple-500" />, title: "AI Risk Assessment", desc: "Disease risks with confidence scores" },
            { icon: <Pill size={20} className="text-rose-500" />, title: "Medicine Interactions", desc: "Any flagged drug interactions" },
            { icon: <AlertTriangle size={20} className="text-amber-500" />, title: "Disclaimer", desc: "AI-generated, not a diagnosis" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-surface-alt)]">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-bg-body)] shadow-sm">{item.icon}</span>
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleDownload} className="btn-primary px-10 py-3.5 text-base flex justify-center items-center gap-2 w-full max-w-sm mx-auto" disabled={loading}>
          <Download size={18} /> Generate & Download PDF
        </button>

        <p className="text-xs text-[var(--color-text-muted)] mt-4">
          <span className="flex items-center justify-center gap-1"><AlertTriangle size={14} /> This report is AI-generated for informational purposes only.</span><br />
          It is not a medical diagnosis. Please consult a licensed physician.
        </p>
      </div>
    </div>
  );
}
