import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', date: '' });
  const [selected, setSelected] = useState(null); // detail modal

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.date)   params.set('date', filters.date);
      const res = await api.get(`/appointments?${params}`);
      setAppointments(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}`, { status });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    if (selected?._id === id) setSelected(s => ({ ...s, status }));
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return;
    await api.delete(`/appointments/${id}`);
    setAppointments(prev => prev.filter(a => a._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const fmt = date => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtFull = date => new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Rendez-vous</div>
          <div className="admin-page-sub">{appointments.length} rendez-vous{filters.status || filters.date ? ' (filtre)' : ''}</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        {/* Filters */}
        <div className="filter-bar">
          <select
            className="form-control"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmes</option>
            <option value="cancelled">Annules</option>
          </select>
          <input
            className="form-control"
            type="date"
            value={filters.date}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
            style={{ width: 'auto' }}
          />
          {(filters.status || filters.date) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', date: '' })}>
              Reinitialiser
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="loader"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>Aucun rendez-vous trouve.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Patient</th>
                <th>Contact</th>
                <th>Medecin</th>
                <th>Date / Heure</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a._id}>
                  <td>
                    <button
                      style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--green-700)' }}
                      onClick={() => setSelected(a)}
                    >
                      {a.ticketNumber}
                    </button>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{a.service}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{a.phone}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{a.email}</div>
                  </td>
                  <td style={{ fontSize: '0.88rem' }}>{a.doctorName}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{fmt(a.appointmentDate)}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{a.appointmentTime}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${a.status}`}>
                      {a.status === 'pending' ? 'En attente' : a.status === 'confirmed' ? 'Confirme' : 'Annule'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {a.status !== 'confirmed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, 'confirmed')}>
                          Confirmer
                        </button>
                      )}
                      {a.status !== 'cancelled' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(a._id, 'cancelled')}>
                          Annuler
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteAppointment(a._id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Rendez-vous — {selected.ticketNumber}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  ['Patient', `${selected.firstName} ${selected.lastName}`],
                  ['Telephone', selected.phone],
                  ['Email', selected.email],
                  ['Medecin', selected.doctorName],
                  ['Service', selected.service],
                  ['Date', fmtFull(selected.appointmentDate)],
                  ['Heure', selected.appointmentTime],
                  ['Motif', selected.reason || '—'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--gray-100)', gap: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--gray-800)', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)', fontWeight: 600 }}>Statut</span>
                  <span className={`badge badge-${selected.status}`}>
                    {selected.status === 'pending' ? 'En attente' : selected.status === 'confirmed' ? 'Confirme' : 'Annule'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selected.status !== 'confirmed' && (
                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(selected._id, 'confirmed')}>
                  Confirmer
                </button>
              )}
              {selected.status !== 'cancelled' && (
                <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(selected._id, 'cancelled')}>
                  Annuler
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => { deleteAppointment(selected._id); setSelected(null); }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}