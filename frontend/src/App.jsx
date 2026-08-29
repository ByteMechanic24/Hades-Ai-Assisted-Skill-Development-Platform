import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearnerProvider } from './context/LearnerContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Global Widgets
import { AppLayout } from './components/layout/AppLayout';
import { FloatingCoachWidget } from './components/assistant/FloatingCoachWidget';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SignInPage, SignUpPage } from './pages/AuthPages';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';

/* ─── Protected Route wrapper ──────────────────────────────── */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LearnerProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Marketing Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              
              {/* Onboarding Wizard (requires auth) */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              {/* Top-Level Aliases */}
              <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
              <Route path="/settings" element={<Navigate to="/dashboard/profile" replace />} />

              {/* Authenticated Application Workspace */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="learning-path" element={<LearningPathPage />} />
                <Route path="resources" element={<Navigate to="/dashboard/learning-path" replace />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="skills" element={<ProgressPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<ProfilePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Persistent Bottom-Right AI Coach Widget */}
            <FloatingCoachWidget />
          </BrowserRouter>
        </LearnerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
