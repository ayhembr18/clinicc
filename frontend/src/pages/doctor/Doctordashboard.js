import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useDoctorAuth } from '../../context/Doctorauthcontext';

export default function DoctorDashboard() {
  const { doctor } = useDoctorAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, done: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/doctor-appointments/upcoming'),
      api.get('/doctor-appointments'),
    ]).then(([upRes, allRes]) => {
      setUpcoming(upRes.data.slice(0, 5));
      const all = allRes.data;
      const today = new Date(); today.setHours(0,0,0,0);
      const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
      setStats({
        total: all.length,
        today: all.filter(a => {
          const d = new Date(a.appointmentDate);
          return d >= today && d <= todayEnd;
        }).length,
        done: all.filter(a => a.status === 'done').length,
        pending: all.filter(a => a.status === 'confirmed').length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = date => new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Bonjour, Dr. {doctor?.firstName} 👋</div>
          <div className="admin-page-sub">{doctor?.specialty} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <Link to="/doctor/appointments" className="btn btn-primary btn-sm" style={{ background: '#2563eb', borderColor: '#2563eb' }}>
          Voir tous mes rendez-vous
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="loader"></div></div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            {[
              { label: 'Total rendez-vous', value: stats.total, cls: '', color: '#2563eb' },
              { label: "Aujourd'hui", value: stats.today, cls: '', color: '#0891b2' },
              { label: 'À venir', value: stats.pending, cls: '', color: '#d97706' },
              { label: 'Consultations terminées', value: stats.done, cls: '', color: '#059669' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <div className="admin-table-title">Prochains rendez-vous</div>
              <Link to="/doctor/appointments" className="btn btn-ghost btn-sm">Voir tout</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p>Aucun rendez-vous à venir.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(a => (
                    <tr key={a._id}>
                      <td><strong>{a.firstName} {a.lastName}</strong><div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{a.phone}</div></td>
                      <td style={{ fontSize: '0.88rem' }}>{a.service}</td>
                      <td style={{ fontWeight: 500 }}>{fmt(a.postponedDate || a.appointmentDate)}</td>
                      <td>{a.postponedTime || a.appointmentTime}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status === 'postponed' ? 'Reporté' : 'Confirmé'}</span></td>
                      <td>
                        <Link to="/doctor/appointments" className="btn btn-ghost btn-sm">Gérer</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}