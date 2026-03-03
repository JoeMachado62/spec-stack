import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SpecBuilderPage from './pages/SpecBuilderPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, fetchProfile, token } = useAuthStore();

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="project/:projectId/spec/:specId" element={<SpecBuilderPage />} />
          <Route path="examples" element={
            <div className="p-8 max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold font-[var(--font-display)] mb-2">Example Library</h1>
              <p className="text-[var(--color-text-muted)] text-sm mb-6">Browse specifications from businesses like yours</p>
              <div className="glass-card p-12 text-center">
                <p className="text-lg font-semibold mb-2">Coming Soon</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Browse and search 20+ pre-built spec templates across different business types.
                </p>
              </div>
            </div>
          } />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
