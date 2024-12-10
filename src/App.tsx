import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './providers/theme-provider';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import LandingPage from './components/landing/LandingPage';

// Protected Components
import MainLayout from './layouts/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import Laundries from './components/laundries/Laundries';
import Reports from './components/reports/Reports';
import Interventions from './components/interventions/Interventions';
import Statistics from './components/statistics/Statistics';
import TicketsTab from './components/tickets/TicketsTab';
import Maintenance from './components/maintenance/Maintenance';
import SettingsTab from './components/settings/SettingsTab';
import FAQ from './components/support/FAQ';
import Support from './components/support/Support';
import AlertsConfig from './components/alerts/AlertsConfig';

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Routes protégées */}
            <Route path="/dashboard" element={<MainLayout />}>
              <Route index element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="laveries" element={
                <ProtectedRoute>
                  <Laundries />
                </ProtectedRoute>
              } />
              <Route path="signalements" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="interventions" element={
                <ProtectedRoute>
                  <Interventions />
                </ProtectedRoute>
              } />
              <Route path="statistiques" element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              } />
              <Route path="tickets" element={
                <ProtectedRoute>
                  <TicketsTab />
                </ProtectedRoute>
              } />
              <Route path="maintenance" element={
                <ProtectedRoute>
                  <Maintenance />
                </ProtectedRoute>
              } />
              <Route path="parametres" element={
                <ProtectedRoute>
                  <SettingsTab />
                </ProtectedRoute>
              } />
              <Route path="faq" element={
                <ProtectedRoute>
                  <FAQ />
                </ProtectedRoute>
              } />
              <Route path="support" element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } />
              <Route path="alertes" element={
                <ProtectedRoute>
                  <AlertsConfig />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
