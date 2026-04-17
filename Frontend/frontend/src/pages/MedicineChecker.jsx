import { useState, useEffect } from "react";
import { getProfile, checkMedicineInteractions } from "../services/api";
import { Pill, Search, CheckCircle, AlertTriangle, Lightbulb, X } from 'lucide-react';
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";

export default function MedicineChecker() {
  const [profileMeds, setProfileMeds] = useState([]);
  const [tempMeds, setTempMeds] = useState([]);
  const [newMed, setNewMed] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success && res.data.profile?.medicines) {
        setProfileMeds(res.data.profile.medicines.map(m => m.name));
      }
    } catch {} finally {
      setLoadingProfile(false);
    }
  };

  const addTempMed = () => {
    if (newMed.trim() && !tempMeds.includes(newMed.trim())) {
      setTempMeds([...tempMeds, newMed.trim()]);
      setNewMed("");
    }
  };

  const removeTempMed = (med) => {
    setTempMeds(tempMeds.filter(m => m !== med));
  };

  const checkInteractions = async () => {
    const allMeds = [...profileMeds, ...tempMeds];
    if (allMeds.length < 2) {
      toast.error("Need at least 2 medicines to check interactions");
      return;
    }

    setLoading(true);
    try {
      const res = await checkMedicineInteractions(allMeds);
      if (res.success) {
        setResult(res.data);
        toast.success("Interaction check complete!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Check failed");
    } finally {
      setLoading(false);
    }
  };

  const severityStyles = {
    mild: { bg: "rgba(16,185,129,0.15)", text: "var(--color-success)", label: "Mild" },
    moderate: { bg: "rgba(245,158,11,0.15)", text: "var(--color-warning)", label: "Moderate" },
    severe: { bg: "rgba(239,68,68,0.15)", text: "var(--color-danger)", label: "Severe" }
  };

  if (loadingProfile) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <LoadingOverlay visible={loading} message="Scanning for drug interactions..." />

      <div className="flex items-center gap-3">
        <Pill size={28} className="text-[var(--color-brand)]" />
        <h1 className="text-2xl font-bold">Medicine Interaction Checker</h1>
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Check for dangerous drug-drug and drug-disease interactions</p>
      </div>

      {/* Current Medicines from Profile */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium mb-3">Your Current Medicines</h3>
        {profileMeds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profileMeds.map((m, i) => (
              <span key={i} className="symptom-chip selected flex items-center gap-1"><Pill size={12} /> {m}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">No medicines in your profile. Add some below to check.</p>
        )}
      </div>

      {/* Add Temporary Medicines */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium mb-3">Add Medicines to Check</h3>
        <div className="flex gap-2 mb-3">
          <input
            className="input-field flex-1"
            placeholder="e.g., Ibuprofen, Aspirin..."
            value={newMed}
            onChange={(e) => setNewMed(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTempMed()}
          />
          <button onClick={addTempMed} className="btn-primary px-4">Add</button>
        </div>
        {tempMeds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tempMeds.map((m, i) => (
              <span key={i} className="symptom-chip selected">
                {m}
                <button className="ml-2 flex items-center justify-center p-0.5 rounded-full hover:bg-black/10" onClick={() => removeTempMed(m)}><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button onClick={checkInteractions} className="btn-primary w-full py-3.5 flex justify-center items-center gap-2" disabled={loading}>
        <Search size={18} /> Check Interactions
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Safe / Unsafe banner */}
          {result.safeToTake ? (
            <div className="rounded-xl p-4 bg-[rgba(16,185,129,0.1)] border border-[var(--color-success)] text-center">
              <div className="flex justify-center mb-1"><CheckCircle size={32} className="text-[var(--color-success)]" /></div>
              <h3 className="font-semibold text-[var(--color-success)] mt-1">All Clear</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">No dangerous interactions detected</p>
            </div>
          ) : (
            <div className="rounded-xl p-4 bg-[rgba(239,68,68,0.1)] border border-[var(--color-danger)] text-center">
              <div className="flex justify-center mb-1"><AlertTriangle size={32} className="text-[var(--color-danger)]" /></div>
              <h3 className="font-semibold text-[var(--color-danger)] mt-1">Interactions Found</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Consult your doctor before taking these together</p>
            </div>
          )}

          {/* Drug-Drug Interactions */}
          {result.drugInteractions?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Drug-Drug Interactions</h3>
              <div className="space-y-3">
                {result.drugInteractions.map((inter, i) => {
                  const style = severityStyles[inter.severity] || severityStyles.mild;
                  return (
                    <div key={i} className="glass-card p-4" style={{ borderLeft: `4px solid ${style.text}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{inter.drug1} + {inter.drug2}</span>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: style.bg, color: style.text }}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">{inter.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drug-Disease Interactions */}
          {result.diseaseInteractions?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Drug-Disease Interactions</h3>
              <div className="space-y-3">
                {result.diseaseInteractions.map((inter, i) => (
                  <div key={i} className="glass-card p-4" style={{ borderLeft: "4px solid var(--color-warning)" }}>
                    <span className="font-medium text-sm">{inter.drug} + {inter.condition}</span>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{inter.warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1"><Lightbulb size={16} /> Recommendation</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{result.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
