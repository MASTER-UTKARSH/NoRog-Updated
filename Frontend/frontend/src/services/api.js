import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000
});

// JWT auto-attach interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("norog_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("norog_token");
      localStorage.removeItem("norog_user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const registerUser = (data) => api.post("/auth/register", data).then(r => r.data);
export const loginUser = (data) => api.post("/auth/login", data).then(r => r.data);

// ─── Profile ───
export const getProfile = () => api.get("/profile").then(r => r.data);
export const saveProfile = (data) => api.post("/profile", data).then(r => r.data);
export const updateMedicines = (medicines) => api.put("/profile/medicines", { medicines }).then(r => r.data);

// ─── Symptoms ───
export const logSymptoms = (formData) => api.post("/symptoms/log", formData, {
  headers: { "Content-Type": "multipart/form-data" },
  timeout: 60000
}).then(r => r.data);
export const getSymptomHistory = () => api.get("/symptoms/history").then(r => r.data);

// ─── AI ───
export const runPrediction = () => api.post("/ai/predict").then(r => r.data);
export const runWhatIf = (scenario) => api.post("/ai/whatif", { scenario }).then(r => r.data);
export const checkSeasonal = () => api.post("/ai/seasonal").then(r => r.data);

// ─── Medicines ───
export const checkMedicineInteractions = (medicines) => api.post("/medicines/check", { medicines }).then(r => r.data);

// ─── Report ───
export const downloadReport = () => api.get("/report/generate", { responseType: "blob" }).then(r => r.data);

// ─── Chat Assistant ───
export const getChatHistory = () => api.get("/chat/history").then(r => r.data);
export const sendChatMessage = (message) => api.post("/chat", { message }).then(r => r.data);
export const getAssistantInsights = () => api.get("/chat/insights").then(r => r.data);
export const resetChatHistory = () => api.delete("/chat/history").then(r => r.data);

export default api;
