import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/Authcontext';
import { DoctorAuthProvider, useDoctorAuth } from './context/Doctorauthcontext';

import PublicLayout from './layouts/Publiclayout';
import AdminLayout from './layouts/Adminlayout';
import DoctorLayout from './layouts/Doctorlayout';

import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import TeamPage from './pages/public/TeamPage';
import AppointmentPage from './pages/public/AppointementPage';
import ContactPage from './pages/public/ContactPage';
import AboutPage from './pages/public/AboutPage';

import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AppointmentsAdminPage from './pages/admin/Appointmentsadminpage';
import DoctorsAdminPage from './pages/admin/Doctorsadminpage';
import MessagesAdminPage from './pages/admin/Messagesadminpage';

import DoctorLoginPage from './pages/doctor/Doctorloginpage';
import DoctorDashboard from './pages/doctor/Doctordashboard';
import DoctorAppointmentsPage from './pages/doctor/Doctorappointmentspage';

function AdminRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="loader"></div></div>;
  return admin ? children : <Navigate to="/admin/login" replace />;
}

function DoctorRoute({ children }) {
  const { doctor, loading } = useDoctorAuth();
  if (loading) return <div className="page-loading"><div className="loader"></div></div>;
  return doctor ? children : <Navigate to="/doctor/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <DoctorAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/appointment" element={<AppointmentPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Route>

            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="appointments" element={<AppointmentsAdminPage />} />
              <Route path="doctors" element={<DoctorsAdminPage />} />
              <Route path="messages" element={<MessagesAdminPage />} />
            </Route>

            <Route path="/doctor/login" element={<DoctorLoginPage />} />
            <Route path="/doctor" element={<DoctorRoute><DoctorLayout /></DoctorRoute>}>
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DoctorAuthProvider>
    </AuthProvider>
  );
}