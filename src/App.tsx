import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './providers/theme-provider';
import { MantineProvider } from './providers/mantine-provider';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Composant de chargement
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
  </div>
);

// Chargement paresseux des composants
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));
const CompleteProfile = lazy(() => import('./components/auth/CompleteProfile'));

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Laundries = lazy(() => import('./pages/Laundries'));
const Technicians = lazy(() => import('./pages/Technicians'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const Statistics = lazy(() => import('./pages/Statistics'));

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <MantineProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<Navigate to="/welcome" replace />} />
                <Route path="/welcome" element={<Login />} />

                {/* Routes publiques */}
                <Route path="/login" element={<Navigate to="/welcome" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />

                {/* Routes protégées */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/laundries" element={<Laundries />} />
                  <Route path="/technicians" element={<Technicians />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Support />} />
                </Route>

                {/* Redirection par défaut */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </MantineProvider>
    </ThemeProvider>
  );
}

export default App;
