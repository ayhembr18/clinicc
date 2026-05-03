import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/Doctorauthcontext';

export default function DoctorLayout() {
  const { doctor, logout } = useDoctorAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/doctor/login'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" style={{ background: '#0f2d45' }}>
        <div className="admin-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div className="admin-sidebar-brand-name">Espace Médecin</div>
              <div className="admin-sidebar-brand-sub">ClinicUrgence</div>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/doctor" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => isActive ? { background: 'rgba(37,99,235,0.25)', color: '#93c5fd' } : {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Tableau de bord
          </NavLink>
          <NavLink to="/doctor/appointments" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => isActive ? { background: 'rgba(37,99,235,0.25)', color: '#93c5fd' } : {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Mes rendez-vous
          </NavLink>
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '12px 16px', marginBottom: '4px' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Connecté en tant que</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              Dr. {doctor?.firstName} {doctor?.lastName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{doctor?.specialty}</div>
          </div>
          <button onClick={handleLogout} className="admin-nav-item" style={{ color: 'rgba(255,100,100,0.8)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}