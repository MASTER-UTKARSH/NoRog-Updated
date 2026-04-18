import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveProfile } from "../services/api";
import toast from "react-hot-toast";
import { User, Hospital, Activity, Dna, Pill, X, Check, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

const COMMON_SYMPTOMS = ["Headache", "Fatigue", "Fever", "Cough", "Body ache", "Nausea", "Dizziness", "Chest pain", "Shortness of breath", "Joint pain", "Back pain", "Insomnia", "Anxiety", "Skin rash", "Stomach pain"];
const MEDICAL_CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Thyroid disorder", "Heart disease", "Obesity", "PCOS", "Depression", "Arthritis", "Migraine", "Anemia", "Kidney disease"];
const RELATIONS = ["Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother"];

const STEPS = [
  { icon: <User size={18} />, label: "Basics", shortLabel: "1" },
  { icon: <Hospital size={18} />, label: "Medical", shortLabel: "2" },
  { icon: <Activity size={18} />, label: "Lifestyle", shortLabel: "3" },
  { icon: <Dna size={18} />, label: "Family & Meds", shortLabel: "4" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    age: "", gender: "",
    currentSymptoms: [], medicalHistory: [], otherCondition: "",
    familyHistory: [],
    lifestyle: { smoker: false, alcohol: "none", exerciseFrequency: "never", sleepHours: 7, diet: "balanced" },
    medicines: [],
    location: { city: "", country: "" }
  });

  const [newFH, setNewFH] = useState({ relation: "Father", condition: "" });
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "daily" });

  const toggleSymptom = (s) => setData(d => ({
    ...d, currentSymptoms: d.currentSymptoms.includes(s) ? d.currentSymptoms.filter(x => x !== s) : [...d.currentSymptoms, s]
  }));

  const toggleCondition = (c) => setData(d => ({
    ...d, medicalHistory: d.medicalHistory.includes(c) ? d.medicalHistory.filter(x => x !== c) : [...d.medicalHistory, c]
  }));

  const addFamilyHistory = () => {
    const condition = newFH.condition.trim();
    if (!condition) { toast.error("Enter a condition name"); return; }
    if (condition.length > 100) { toast.error("Condition name is too long"); return; }
    const exists = data.familyHistory.some(fh => fh.relation === newFH.relation && fh.condition.toLowerCase() === condition.toLowerCase());
    if (exists) { toast.error("This entry already exists"); return; }
    setData(d => ({ ...d, familyHistory: [...d.familyHistory, { relation: newFH.relation, condition }] }));
    setNewFH({ relation: "Father", condition: "" });
  };

  const addMedicine = () => {
    const name = newMed.name.trim();
    if (!name) { toast.error("Enter the medicine name"); return; }
    if (name.length > 100) { toast.error("Medicine name is too long"); return; }
    const exists = data.medicines.some(m => m.name.toLowerCase() === name.toLowerCase());
    if (exists) { toast.error("This medicine is already added"); return; }
    setData(d => ({ ...d, medicines: [...d.medicines, { name, dosage: newMed.dosage.trim(), frequency: newMed.frequency }] }));
    setNewMed({ name: "", dosage: "", frequency: "daily" });
  };

  const handleAgeChange = (e) => {
    const raw = e.target.value;
    if (raw === "") { setData({ ...data, age: "" }); return; }
    if (!/^\d+$/.test(raw)) return;
    const num = parseInt(raw, 10);
    if (num > 120) return;
    setData({ ...data, age: raw });
  };

  const validateStep = (targetStep) => {
    if (step === 1 && targetStep > 1) {
      const age = parseInt(data.age, 10);
      if (!data.age || isNaN(age)) { toast.error("Please enter your age"); return false; }
      if (age < 1 || age > 120) { toast.error("Age must be between 1 and 120"); return false; }
      if (!data.gender) { toast.error("Please select your gender"); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep(step + 1)) setStep(s => s + 1); };

  const handleSubmit = async () => {
    const age = parseInt(data.age, 10);
    if (!data.age || isNaN(age) || age < 1 || age > 120) { toast.error("Please go back and enter a valid age"); return; }
    if (!data.gender) { toast.error("Please go back and select your gender"); return; }

    setLoading(true);
    try {
      await saveProfile({
        age, gender: data.gender,
        location: { city: data.location.city.trim().slice(0, 100), country: data.location.country.trim().slice(0, 100) },
        currentSymptoms: data.currentSymptoms,
        medicalHistory: data.otherCondition.trim() ? [...data.medicalHistory, data.otherCondition.trim().slice(0, 100)] : data.medicalHistory,
        familyHistory: data.familyHistory,
        lifestyle: data.lifestyle,
        medicines: data.medicines
      });
      toast.success("Profile saved! Welcome to Noरोग");
      navigate("/dashboard");
    } catch { toast.error("Failed to save profile"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10 md:py-16 bg-[var(--color-bg-body)]">
      <div className="w-full max-w-xl">

        {/* ── Step Indicator ── */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => {
            const stepNum = i + 1;
            const isCurrent = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isCurrent
                        ? "bg-[var(--color-brand)] text-white shadow-sm"
                        : isDone
                        ? "bg-[var(--color-success-alpha)] text-[var(--color-success)]"
                        : "bg-[var(--color-bg-surface-alt)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {isDone ? <Check size={16} /> : s.icon}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-semibold ${isCurrent ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-3">
                    <div className="h-[2px] rounded-full" style={{ background: isDone ? "var(--color-success)" : "var(--color-border)" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Card ── */}
        <div className="card-elevated p-7 md:p-8">

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Basic Information</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Tell us a bit about yourself to personalize predictions.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Age <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <input type="text" inputMode="numeric" className="input-field" placeholder="25"
                    value={data.age} onChange={handleAgeChange} maxLength={3} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Gender <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <select className="input-field" value={data.gender} onChange={(e) => setData({...data, gender: e.target.value})}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                  Current Symptoms <span className="text-[var(--color-text-muted)] font-normal">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)}
                      className={`symptom-chip ${data.currentSymptoms.includes(s) ? "selected" : ""}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Medical History */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Medical History</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Select any conditions you've been diagnosed with.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {MEDICAL_CONDITIONS.map(c => (
                  <button key={c} onClick={() => toggleCondition(c)}
                    className={`symptom-chip ${data.medicalHistory.includes(c) ? "selected" : ""}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Other conditions</label>
                <input className="input-field" placeholder="Type any other condition..." value={data.otherCondition}
                  maxLength={100} onChange={(e) => setData({...data, otherCondition: e.target.value})} />
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Your Lifestyle</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Lifestyle details help improve prediction accuracy.</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-surface-alt)]">
                <span className="text-sm font-medium text-[var(--color-text)]">Do you smoke?</span>
                <button onClick={() => setData({...data, lifestyle: {...data.lifestyle, smoker: !data.lifestyle.smoker}})}
                  className={`w-12 h-6 rounded-full transition-all relative ${data.lifestyle.smoker ? "bg-[var(--color-danger)]" : "bg-[var(--color-border)]"}`}>
                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${data.lifestyle.smoker ? "left-[26px]" : "left-[3px]"}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Alcohol</label>
                  <select className="input-field" value={data.lifestyle.alcohol}
                    onChange={(e) => setData({...data, lifestyle: {...data.lifestyle, alcohol: e.target.value}})}>
                    <option value="none">None</option>
                    <option value="occasional">Occasional</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Exercise</label>
                  <select className="input-field" value={data.lifestyle.exerciseFrequency}
                    onChange={(e) => setData({...data, lifestyle: {...data.lifestyle, exerciseFrequency: e.target.value}})}>
                    <option value="never">Never</option>
                    <option value="1-2x">1-2 times/week</option>
                    <option value="3-5x">3-5 times/week</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                  Sleep: <span className="text-[var(--color-brand)] font-bold">{data.lifestyle.sleepHours} hrs</span>
                </label>
                <input type="range" min="3" max="12" step="0.5" value={data.lifestyle.sleepHours}
                  className="w-full accent-[var(--color-brand)] h-1.5"
                  onChange={(e) => setData({...data, lifestyle: {...data.lifestyle, sleepHours: Number(e.target.value)}})} />
                <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
                  <span>3 hrs</span><span>12 hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Diet Type</label>
                <select className="input-field" value={data.lifestyle.diet}
                  onChange={(e) => setData({...data, lifestyle: {...data.lifestyle, diet: e.target.value}})}>
                  <option value="balanced">Balanced</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="junk-heavy">Junk Food Heavy</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Family + Meds + Location */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Family History & Medications</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Genetic data improves risk predictions significantly.</p>
              </div>

              {/* Family History */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Family History</label>
                <div className="flex gap-2 mb-2">
                  <select className="input-field flex-shrink-0 w-28" value={newFH.relation}
                    onChange={(e) => setNewFH({...newFH, relation: e.target.value})}>
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input className="input-field flex-1" placeholder="Condition (e.g., Diabetes)"
                    value={newFH.condition} onChange={(e) => setNewFH({...newFH, condition: e.target.value})}
                    maxLength={100} onKeyDown={(e) => e.key === "Enter" && addFamilyHistory()} />
                  <button onClick={addFamilyHistory} className="btn-primary px-3 py-2 text-sm">+</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.familyHistory.map((fh, i) => (
                    <span key={i} className="symptom-chip selected text-xs">
                      {fh.relation} · {fh.condition}
                      <button className="ml-1.5 p-0.5 rounded hover:bg-black/5" onClick={() => setData(d => ({...d, familyHistory: d.familyHistory.filter((_, j) => j !== i)}))}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Medicines */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Current Medicines</label>
                <div className="flex gap-2 mb-2">
                  <input className="input-field flex-1" placeholder="Medicine name" value={newMed.name}
                    onChange={(e) => setNewMed({...newMed, name: e.target.value})} maxLength={100}
                    onKeyDown={(e) => e.key === "Enter" && addMedicine()} />
                  <input className="input-field w-20" placeholder="Dosage" value={newMed.dosage}
                    onChange={(e) => setNewMed({...newMed, dosage: e.target.value})} maxLength={50} />
                  <button onClick={addMedicine} className="btn-primary px-3 py-2 text-sm">+</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.medicines.map((m, i) => (
                    <span key={i} className="symptom-chip selected text-xs">
                      <Pill size={11} /> {m.name} {m.dosage && `(${m.dosage})`}
                      <button className="ml-1.5 p-0.5 rounded hover:bg-black/5" onClick={() => setData(d => ({...d, medicines: d.medicines.filter((_, j) => j !== i)}))}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
                  <MapPin size={12} /> Location <span className="font-normal text-[var(--color-text-muted)]">(for seasonal alerts)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="City" value={data.location.city}
                    maxLength={100} onChange={(e) => setData({...data, location: {...data.location, city: e.target.value}})} />
                  <input className="input-field" placeholder="Country" value={data.location.country}
                    maxLength={100} onChange={(e) => setData({...data, location: {...data.location, country: e.target.value}})} />
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-[var(--color-border)]">
            <button onClick={() => setStep(s => s - 1)}
              className={`btn-ghost text-sm ${step === 1 ? "invisible" : ""}`}>
              <ArrowLeft size={14} /> Back
            </button>
            {step < 4 ? (
              <button onClick={handleNext} className="btn-primary text-sm">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary text-sm" disabled={loading}>
                {loading ? "Saving..." : "Complete Setup"} {!loading && <Check size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
