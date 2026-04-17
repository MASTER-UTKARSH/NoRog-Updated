import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Camera, FileText, X, AlertTriangle } from 'lucide-react';
import { logSymptoms } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";

const SYMPTOMS = [
  "Headache", "Fever", "Cough", "Cold", "Fatigue", "Body ache", "Nausea",
  "Vomiting", "Diarrhea", "Chest pain", "Shortness of breath", "Dizziness",
  "Joint pain", "Back pain", "Skin rash", "Sore throat", "Runny nose",
  "Stomach pain", "Muscle cramp", "Swelling", "Weight loss", "Weight gain",
  "Insomnia", "Anxiety", "Palpitations", "Blurred vision", "Ear pain"
];

export default function SymptomLogger() {
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const filteredSymptoms = SYMPTOMS.filter(s =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSymptom = (s) => {
    setSelected(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Select at least one symptom");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("symptoms", JSON.stringify(selected));
      formData.append("severity", severity);
      formData.append("notes", notes);
      if (photo) formData.append("photo", photo);

      const res = await logSymptoms(formData);
      
      if (res.success) {
        toast.success("Symptoms logged successfully!");
        
        if (res.data.warning?.warningTriggered) {
          toast(res.data.warning.reason, { icon: <AlertTriangle size={16} color="orange"/>, duration: 6000 });
        }
        
        // Reset form
        setSelected([]);
        setSeverity(5);
        setNotes("");
        setPhoto(null);
        setPhotoPreview(null);
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Failed to log symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const severityColor = severity > 7 ? "var(--color-danger)" : severity > 4 ? "var(--color-warning)" : "var(--color-success)";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <LoadingOverlay visible={loading} message="Analyzing your symptoms and checking for warnings..." />

      <div className="flex items-center gap-3">
        <FileText size={28} className="text-[var(--color-brand)]" />
        <h1 className="text-2xl font-bold">Log Symptoms</h1>
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Track your symptoms for more accurate AI predictions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Symptom Selection */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3">Select Symptoms</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={16} />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Search symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filteredSymptoms.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={`symptom-chip ${selected.includes(s) ? "selected" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)]">Selected ({selected.length}):</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selected.map(s => (
                  <span key={s} className="symptom-chip selected text-xs">
                    {s}
                    <button type="button" className="ml-1.5 flex items-center justify-center p-0.5 rounded-full hover:bg-black/10" onClick={() => toggleSymptom(s)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Severity */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3">Severity Level: <span style={{ color: severityColor }}>{severity}/10</span></h3>
          <input
            type="range" min="1" max="10" value={severity}
            className="w-full accent-[var(--color-brand)]"
            onChange={(e) => setSeverity(Number(e.target.value))}
          />
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
            <span>Mild</span><span>Moderate</span><span>Severe</span>
          </div>
          <div className="severity-bar mt-2">
            <div className="severity-bar-fill" style={{ width: `${severity * 10}%`, background: severityColor }} />
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3">Additional Notes</h3>
          <textarea
            className="input-field resize-none h-24"
            placeholder="Describe how you're feeling, when symptoms started, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Photo Upload */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Camera size={16} /> Photo Upload (Optional)</h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">Upload a photo of visible symptoms (rash, swelling, etc.) for AI analysis</p>
          
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
          
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Symptom" className="rounded-xl max-h-48 object-cover w-full" />
              <button
                type="button"
                className="absolute top-2 right-2 w-8 h-8 bg-[rgba(0,0,0,0.6)] rounded-full flex items-center justify-center text-white"
                onClick={() => { setPhoto(null); setPhotoPreview(null); }}
              ><X size={16} /></button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-all flex flex-col items-center gap-2"
            >
              <Camera size={24} /> Click to upload photo
            </button>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full py-3.5" disabled={loading || selected.length === 0}>
          Log Symptoms & Check Warnings
        </button>
      </form>
    </div>
  );
}
