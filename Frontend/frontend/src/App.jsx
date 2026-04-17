import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import SymptomLogger from "./pages/SymptomLogger";
import AIAnalysis from "./pages/AIAnalysis";
import WhatIf from "./pages/WhatIf";
import MedicineChecker from "./pages/MedicineChecker";
import HealthHistory from "./pages/HealthHistory";
import ChatAssistant from "./components/ChatAssistant";
import { ShieldAlert } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const noNavRoutes = ["/", "/auth", "/onboarding", "/dashboard"];
  const showNav = isAuthenticated && !noNavRoutes.includes(location.pathname);

  return (
    <div className={showNav ? "md:pl-[240px]" : ""}>
      {showNav && <Navbar />}
      <main className={`min-h-screen ${showNav ? "px-4 md:px-8 py-6 pb-24 md:pb-6" : ""}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
          
          {/* Onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute><Onboarding /></ProtectedRoute>
          } />
          
          {/* Protected app routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/symptoms" element={
            <ProtectedRoute><SymptomLogger /></ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute><AIAnalysis /></ProtectedRoute>
          } />
          <Route path="/whatif" element={
            <ProtectedRoute><WhatIf /></ProtectedRoute>
          } />
          <Route path="/medicines" element={
            <ProtectedRoute><MedicineChecker /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><HealthHistory /></ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Disclaimer Footer (only on main pages) */}
      <ChatAssistant />
      {showNav && (
        <footer className="text-center py-4 px-4 text-xs text-[var(--color-text-muted)] md:pl-[240px]">
          <p className="flex items-center justify-center gap-2"><ShieldAlert size={14} /> NoRog is an AI-powered health intelligence tool, not a medical diagnosis system.</p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
