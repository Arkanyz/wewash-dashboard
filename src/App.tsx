import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './providers/theme-provider';
import { MantineProvider } from './providers/mantine-provider';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';

// Protected Components
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Laundries from './pages/Laundries';
import Technicians from './pages/Technicians';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Support from './pages/Support';

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <MantineProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Routes protégées */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="laundries" element={<Laundries />} />
                <Route path="technicians" element={<Technicians />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* Redirection par défaut vers le dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </MantineProvider>
    </ThemeProvider>
  );
}

export default App;
