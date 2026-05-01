import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/Authcontext';

// Layouts
import PublicLayout from './layouts/Publiclayout';
import AdminLayout from './layouts/Adminlayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import TeamPage from './pages/public/TeamPage';
import AppointmentPage from './pages/public/AppointementPage';
import ContactPage from './pages/public/ContactPage';
import AboutPage from './pages/public/AboutPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AppointmentsAdminPage from './pages/admin/Appointmentsadminpage';
import DoctorsAdminPage from './pages/admin/Doctorsadminpage';
import MessagesAdminPage from './pages/admin/Messagesadminpage';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="loader"></div></div>;
  return admin ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Admin login (no layout) */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsAdminPage />} />
            <Route path="doctors" element={<DoctorsAdminPage />} />
            <Route path="messages" element={<MessagesAdminPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}