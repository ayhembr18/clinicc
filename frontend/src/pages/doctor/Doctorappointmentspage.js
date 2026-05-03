import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useDoctorAuth } from '../../context/Doctorauthcontext';

const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', postponed: 'Reporté', done: 'Terminé' };
const STATUS_BADGE  = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', postponed: 'badge-pending', done: 'badge-read' };

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function DoctorAppointmentsPage() {
  const { doctor } = useDoctorAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // 'postpone' | 'cancel' | 'done'
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Postpone form
  const [postponeForm, setPostponeForm] = useState({ postponedDate: '', postponedTime: '', postponeReason: '' });
  // Cancel form
  const [cancelReason, setCancelReason] = useState('');
  // Done forms
  const [ordonnance, setOrdonnance] = useState({ medicines: [], notes: '' });
  const [certificate, setCertificate] = useState({ enabled: false, type: 'work', daysOff: 1, startDate: '', reason: '', notes: '' });
  const [report, setReport] = useState({ enabled: false, diagnosis: '', findings: '', recommendations: '', followUp: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/doctor-appointments${params}`);
      setAppointments(res.data);
    } catch {} finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const openModal = (type, appt) => {
    setSelected(appt);
    setError('');
    setModal(type);
    if (type === 'postpone') setPostponeForm({ postponedDate: '', postponedTime: '', postponeReason: '' });
    if (type === 'cancel') setCancelReason('');
    if (type === 'done') {
      setOrdonnance({ medicines: [], notes: '' });
      setCertificate({ enabled: false, type: 'work', daysOff: 1, startDate: '', reason: '', notes: '' });
      setReport({ enabled: false, diagnosis: '', findings: '', recommendations: '', followUp: '' });
    }
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  // Ordonnance helpers
  const addMed = () => setOrdonnance(o => ({ ...o, medicines: [...o.medicines, { ...emptyMed }] }));
  const removeMed = i => setOrdonnance(o => ({ ...o, medicines: o.medicines.filter((_, idx) => idx !== i) }));
  const updateMed = (i, key, val) => setOrdonnance(o => ({
    ...o, medicines: o.medicines.map((m, idx) => idx === i ? { ...m, [key]: val } : m)
  }));

  const handlePostpone = async () => {
    if (!postponeForm.postponedDate || !postponeForm.postponedTime) { setError('Date et heure requises.'); return; }
    setSaving(true);
    try {
      const res = await api.put(`/doctor-appointments/${selected._id}/postpone`, postponeForm);
      setAppointments(prev => prev.map(a => a._id === selected._id ? res.data : a));
      closeModal();
    } catch { setError('Erreur lors du report.'); } finally { setSaving(false); }
  };

  const handleCancel = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/doctor-appointments/${selected._id}/cancel`, { cancelReason });
      setAppointments(prev => prev.map(a => a._id === selected._id ? res.data : a));
      closeModal();
    } catch { setError('Erreur lors de l\'annulation.'); } finally { setSaving(false); }
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      const payload = {
        ordonnance: ordonnance.medicines.length > 0 ? ordonnance : null,
        certificate: certificate.enabled ? { ...certificate } : null,
        report: report.enabled ? { ...report } : null,
      };
      const res = await api.put(`/doctor-appointments/${selected._id}/done`, payload);
      setAppointments(prev => prev.map(a => a._id === selected._id ? res.data : a));
      closeModal();
    } catch { setError('Erreur lors de la finalisation.'); } finally { setSaving(false); }
  };

  const fmt = date => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: '8px', fontSize: '0.88rem', background: 'var(--gray-50)', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: '4px' };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Mes rendez-vous</div>
          <div className="admin-page-sub">Dr. {doctor?.firstName} {doctor?.lastName} — {appointments.length} rendez-vous</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="filter-bar">
          {['', 'confirmed', 'postponed', 'done', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="btn btn-sm"
              style={{ borderRadius: '100px', background: filterStatus === s ? '#2563eb' : 'white', color: filterStatus === s ? 'white' : 'var(--gray-600)', border: '1.5px solid ' + (filterStatus === s ? '#2563eb' : 'var(--gray-200)') }}>
              {s === '' ? 'Tous' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="loader"></div></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p>Aucun rendez-vous trouvé.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Date / Heure</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a._id}>
                  <td><strong>{a.firstName} {a.lastName}</strong></td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{a.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{a.phone}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{a.service}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{fmt(a.postponedDate || a.appointmentDate)}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{a.postponedTime || a.appointmentTime}</div>
                    {a.status === 'postponed' && <div style={{ fontSize: '0.72rem', color: 'var(--amber-600)' }}>Reporté</div>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-600)', maxWidth: '140px' }}>
                    {a.reason || <span style={{ color: 'var(--gray-300)' }}>—</span>}
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{STATUS_LABELS[a.status]}</span></td>
                  <td>
                    {(a.status === 'confirmed' || a.status === 'postponed') && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button className="btn btn-sm" style={{ background: '#059669', color: 'white', borderRadius: '6px', border: 'none', padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => openModal('done', a)}>
                           Terminer
                        </button>
                        <button className="btn btn-sm" style={{ background: '#d97706', color: 'white', borderRadius: '6px', border: 'none', padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => openModal('postpone', a)}>
                           Reporter
                        </button>
                        <button className="btn btn-sm" style={{ background: '#e53e3e', color: 'white', borderRadius: '6px', border: 'none', padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => openModal('cancel', a)}>
                           Annuler
                        </button>
                      </div>
                    )}
                    {a.status === 'done' && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                        {a.ordonnance ? ' ' : ''}{a.certificate ? ' ' : ''}{a.report ? ' ' : ''}
                        Terminé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── POSTPONE MODAL ── */}
      {modal === 'postpone' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Reporter le rendez-vous</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginBottom: '20px' }}>
                Patient : <strong>{selected.firstName} {selected.lastName}</strong>
              </p>
              <div className="form-group">
                <label style={labelStyle}>Nouvelle date *</label>
                <input style={inputStyle} type="date" value={postponeForm.postponedDate} onChange={e => setPostponeForm(f => ({ ...f, postponedDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label style={labelStyle}>Nouvel horaire *</label>
                <input style={inputStyle} type="time" value={postponeForm.postponedTime} onChange={e => setPostponeForm(f => ({ ...f, postponedTime: e.target.value }))} />
              </div>
              <div className="form-group">
                <label style={labelStyle}>Raison du report</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={postponeForm.postponeReason} onChange={e => setPostponeForm(f => ({ ...f, postponeReason: e.target.value }))} placeholder="Ex : Urgence médicale, indisponibilité..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>Annuler</button>
              <button className="btn btn-sm" style={{ background: '#d97706', color: 'white', border: 'none' }} onClick={handlePostpone} disabled={saving}>{saving ? 'Report...' : 'Confirmer le report'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL MODAL ── */}
      {modal === 'cancel' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Annuler le rendez-vous</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginBottom: '20px' }}>
                Patient : <strong>{selected.firstName} {selected.lastName}</strong><br />
                Le patient sera notifié par email.
              </p>
              <div className="form-group">
                <label style={labelStyle}>Raison de l'annulation</label>
                <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Ex : Indisponibilité du médecin..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>Retour</button>
              <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={saving}>{saving ? 'Annulation...' : 'Confirmer l\'annulation'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DONE MODAL ── */}
      {modal === 'done' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Terminer la consultation</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error">{error}</div>}

              <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginBottom: '24px' }}>
                Patient : <strong>{selected.firstName} {selected.lastName}</strong> —
                Les documents seront envoyés automatiquement par email au patient.
              </p>

              {/* ── Ordonnance ── */}
              <div style={{ marginBottom: '28px', padding: '20px', border: '2px solid #1f9d5f', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#0a3d27', margin: 0 }}>💊 Ordonnance médicale</h3>
                  <button type="button" className="btn btn-sm" style={{ background: '#1f9d5f', color: 'white', border: 'none', borderRadius: '6px' }} onClick={addMed}>
                    + Ajouter médicament
                  </button>
                </div>

                {ordonnance.medicines.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', fontStyle: 'italic', textAlign: 'center', padding: '12px' }}>
                    Aucun médicament — cliquez sur "Ajouter médicament" pour créer l'ordonnance.
                  </p>
                )}

                {ordonnance.medicines.map((med, i) => (
                  <div key={i} style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gray-600)' }}>Médicament {i + 1}</span>
                      <button onClick={() => removeMed(i)} style={{ color: 'var(--red-500)', fontSize: '0.9rem', cursor: 'pointer' }}>✕ Supprimer</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>Nom *</label>
                        <input style={inputStyle} value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="Ex: Amoxicilline 1g" />
                      </div>
                      <div>
                        <label style={labelStyle}>Dosage</label>
                        <input style={inputStyle} value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="Ex: 500mg" />
                      </div>
                      <div>
                        <label style={labelStyle}>Fréquence</label>
                        <input style={inputStyle} value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} placeholder="Ex: 3 fois/jour" />
                      </div>
                      <div>
                        <label style={labelStyle}>Durée</label>
                        <input style={inputStyle} value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} placeholder="Ex: 7 jours" />
                      </div>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <label style={labelStyle}>Instructions spéciales</label>
                      <input style={inputStyle} value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} placeholder="Ex: Prendre avec de la nourriture" />
                    </div>
                  </div>
                ))}

                {ordonnance.medicines.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={labelStyle}>Notes générales</label>
                    <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={ordonnance.notes} onChange={e => setOrdonnance(o => ({ ...o, notes: e.target.value }))} placeholder="Conseils supplémentaires..." />
                  </div>
                )}
              </div>

              {/* ── Certificat médical ── */}
              <div style={{ marginBottom: '28px', padding: '20px', border: `2px solid ${certificate.enabled ? '#3b82f6' : 'var(--gray-200)'}`, borderRadius: '12px', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: certificate.enabled ? '16px' : 0 }}>
                  <input type="checkbox" id="certEnabled" checked={certificate.enabled} onChange={e => setCertificate(c => ({ ...c, enabled: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  <label htmlFor="certEnabled" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#1e3a8a', cursor: 'pointer', margin: 0 }}>
                     Certificat médical
                  </label>
                </div>
                {certificate.enabled && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={labelStyle}>Type</label>
                        <select style={inputStyle} value={certificate.type} onChange={e => setCertificate(c => ({ ...c, type: e.target.value }))}>
                          <option value="work">Arrêt de travail</option>
                          <option value="study">Dispense d'études</option>
                          <option value="sports">Dispense de sport</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Nombre de jours</label>
                        <input style={inputStyle} type="number" min="1" value={certificate.daysOff} onChange={e => setCertificate(c => ({ ...c, daysOff: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={labelStyle}>Date de début</label>
                      <input style={inputStyle} type="date" value={certificate.startDate} onChange={e => setCertificate(c => ({ ...c, startDate: e.target.value }))} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={labelStyle}>Raison / Diagnostic</label>
                      <input style={inputStyle} value={certificate.reason} onChange={e => setCertificate(c => ({ ...c, reason: e.target.value }))} placeholder="Ex: Syndrome grippal" />
                    </div>
                    <div>
                      <label style={labelStyle}>Notes</label>
                      <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={certificate.notes} onChange={e => setCertificate(c => ({ ...c, notes: e.target.value }))} placeholder="Recommandations supplémentaires..." />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Compte rendu ── */}
              <div style={{ padding: '20px', border: `2px solid ${report.enabled ? '#8b5cf6' : 'var(--gray-200)'}`, borderRadius: '12px', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: report.enabled ? '16px' : 0 }}>
                  <input type="checkbox" id="reportEnabled" checked={report.enabled} onChange={e => setReport(r => ({ ...r, enabled: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  <label htmlFor="reportEnabled" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#4c1d95', cursor: 'pointer', margin: 0 }}>
                     Compte rendu médical
                  </label>
                </div>
                {report.enabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      ['diagnosis', 'Diagnostic'],
                      ['findings', 'Observations cliniques'],
                      ['recommendations', 'Recommandations'],
                      ['followUp', 'Suivi préconisé'],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label style={labelStyle}>{label}</label>
                        <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={report[key]} onChange={e => setReport(r => ({ ...r, [key]: e.target.value }))} placeholder={`${label}...`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>Annuler</button>
              <button className="btn btn-sm" style={{ background: '#059669', color: 'white', border: 'none' }} onClick={handleDone} disabled={saving}>
                {saving ? 'Envoi en cours...' : ' Terminer & envoyer les documents'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}