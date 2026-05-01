import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/stats/summary'),
      api.get('/appointments?limit=5'),
    ]).then(([statsRes, recentRes]) => {
      setStats(statsRes.data);
      setRecent(recentRes.data.slice(0, 8));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = date => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const STAT_CARDS = stats ? [
    { label: 'Total rendez-vous', value: stats.total, sub: 'Depuis le debut', cls: 'stat-card-accent' },
    { label: 'En attente', value: stats.pending, sub: 'A confirmer', cls: 'stat-card-pending' },
    { label: 'Confirmes', value: stats.confirmed, sub: 'Valides', cls: 'stat-card-confirmed' },
    { label: "Aujourd'hui", value: stats.todayCount, sub: 'Rendez-vous du jour', cls: 'stat-card-accent' },
  ] : [];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Tableau de bord</div>
          <div className="admin-page-sub">Vue d'ensemble de la clinique</div>
        </div>
        <Link to="/admin/appointments" className="btn btn-primary btn-sm">
          Voir tous les rendez-vous
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            {STAT_CARDS.map(card => (
              <div key={card.label} className={`stat-card ${card.cls}`}>
                <div className="stat-card-label">{card.label}</div>
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-sub">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent appointments */}
          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <div className="admin-table-title">Rendez-vous recents</div>
              <Link to="/admin/appointments" className="btn btn-ghost btn-sm">Voir tout</Link>
            </div>
            {recent.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p>Aucun rendez-vous pour le moment.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Patient</th>
                    <th>Medecin</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(a => (
                    <tr key={a._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>{a.ticketNumber}</span></td>
                      <td><strong>{a.firstName} {a.lastName}</strong></td>
                      <td>{a.doctorName}</td>
                      <td>{a.service}</td>
                      <td>{fmt(a.appointmentDate)}</td>
                      <td>{a.appointmentTime}</td>
                      <td>
                        <span className={`badge badge-${a.status}`}>
                          {a.status === 'pending' ? 'En attente' : a.status === 'confirmed' ? 'Confirme' : 'Annule'}
                        </span>
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