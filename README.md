# <div align="center">🩺 Noरोग (NoRog)</div>

<div align="center">
  <strong>Proactive. Preventive. Personal.</strong><br>
  <em>Predicting health risks before they become symptoms.</em>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2F%20Vite-blue" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green" alt="Backend" />
  <img src="https://img.shields.io/badge/AI-Groq%20LLM-orange" alt="AI" />
  <img src="https://img.shields.io/badge/Database-Firebase%20Firestore-yellow" alt="Database" />
  <img src="https://img.shields.io/badge/Deployment-Netlify%20%26%20Render-informational" alt="Deployment" />
</div>

---

## 🚀 The Vision
**Noरोग** is a next-generation healthcare intelligence platform designed for the **Hackathon 2026**. Most healthcare systems are *reactive*—you go to the doctor when you are already sick. Noरोग is *proactive*—it analyzes your lifestyle, environment, and genetic predispositions to predict risks up to a year in advance, helping you stay healthy rather than just getting treated.

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🧠 AI Risk Prediction** | Uses Groq-powered LLMs to analyze symptoms and lifestyle data, providing a specialized Health Score (0-100). |
| **🔮 What-If Simulations** | Simulate lifestyle changes (e.g., "What if I start smoking?" or "What if I exercise 5x a week?") and see projected impacts over 1 month, 6 months, and 1 year. |
| **🌡️ Seasonal Risk Check** | Automatically detects seasonal disease outbreaks based on your real-time location and current weather patterns. |
| **💬 AI Health Assistant** | A 24/7 intelligent chat assistant that helps log symptoms, answers health queries, and tracks your progress. |
| **📊 Health History** | Beautiful visualizations of your health trends using Recharts. |
| **📄 PDF Reports** | Generate professional, clinical-grade health reports with a single click to share with your actual physician. |

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS with a Premium "Glassmorphism" Design System
- **Icons**: Lucide React
- **Charts**: Recharts (for data visualization)
- **State Management**: React Hooks & Context API
- **Networking**: Axios

### Backend
- **Platform**: Node.js & Express
- **AI Engine**: Groq SDK (Llama 3 / Mixtral)
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Document Generation**: PDFKit

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- A Groq API Key
- A Firebase Service Account

### 1. Clone the repository
```bash
git clone https://github.com/MASTER-UTKARSH/NoRog-Updated.git
cd NoRog-Updated
```

### 2. Setup Backend
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` folder:
```env
PORT=5001
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_key
FIREBASE_SERVICE_ACCOUNT={"your":"json_here"}
FRONTEND_URL=https://no-rog.netlify.app
```
`npm start`

### 3. Setup Frontend
```bash
cd Frontend/frontend
npm install
```
Create a `.env` file in the `Frontend/frontend` folder:
```env
VITE_API_URL=https://norog-updated.onrender.com/api
```
`npm run dev`

---

## 📐 Architecture
Noरोग follows a modern decoupled architecture:
1. **User interaction** happens in the React dashboard.
2. **Requests** are passed through a JWT-secured API.
3. **AI Logic** is processed by Groq Cloud, referencing the specific user's health profile.
4. **Persistence** is handled by Firebase, allowing for real-time updates and multi-device sync.

---

## 🏆 Hackathon Goals
- [x] Functional AI Prediction Engine
- [x] Real-time Seasonal Risk Detection
- [x] Multi-Timeframe What-If Scenarios
- [x] Production Deployment (Netlify/Render)
- [ ] Mobile App Wrapper (Upcoming)
- [ ] Wearable Device Integration (Upcoming)

---

<div align="center">
  Built with ❤️ for a Healthier Future.
  <br>
  <strong>Team Noरोग</strong>
</div>
