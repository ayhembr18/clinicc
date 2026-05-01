import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const emptyDoctor = {
  firstName: '', lastName: '', specialty: '', bio: '', phone: '', email: '', photo: '',
  availability: [], isActive: true
};

const emptySlot = { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 };

export default function DoctorsAdminPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyDoctor);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors/all');
      setDoctors(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyDoctor); setError(''); setModal('add'); };
  const openEdit = d => { setForm({ ...d, availability: d.availability || [] }); setError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setError(''); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addSlot = () => setForm(f => ({ ...f, availability: [...f.availability, { ...emptySlot }] }));
  const removeSlot = i => setForm(f => ({ ...f, availability: f.availability.filter((_, idx) => idx !== i) }));
  const updateSlot = (i, key, val) => setForm(f => ({
    ...f,
    availability: f.availability.map((s, idx) => idx === i ? { ...s, [key]: key === 'dayOfWeek' || key === 'slotDurationMinutes' ? Number(val) : val } : s)
  }));

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.specialty) {
      setError('Prenom, nom et specialite sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        const res = await api.post('/doctors', form);
        setDoctors(prev => [...prev, res.data]);
      } else {
        const res = await api.put(`/doctors/${form._id}`, form);
        setDoctors(prev => prev.map(d => d._id === form._id ? res.data : d));
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally { setSaving(false); }
  };

  const toggleActive = async (doctor) => {
    const res = await api.put(`/doctors/${doctor._id}`, { isActive: !doctor.isActive });
    setDoctors(prev => prev.map(d => d._id === doctor._id ? res.data : d));
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Equipe medicale</div>
          <div className="admin-page-sub">{doctors.length} medecin{doctors.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          Ajouter un medecin
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loader"></div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <p>Aucun medecin enregistre. Cliquez sur "Ajouter un medecin" pour commencer.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {doctors.map(d => (
            <div key={d._id} className="card" style={{ opacity: d.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--green-100), var(--green-200))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--green-600)'
                }}>
                  {d.firstName[0]}{d.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--green-900)' }}>
                    Dr. {d.firstName} {d.lastName}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-500)', margin: '2px 0 6px' }}>
                    {d.specialty}
                  </div>
                  <span className={`badge ${d.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                    {d.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {d.bio && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: '1.6', marginTop: '12px' }}>
                  {d.bio.length > 120 ? d.bio.substring(0, 120) + '…' : d.bio}
                </p>
              )}

              {d.availability && d.availability.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {d.availability.map((a, i) => (
                    <span key={i} className="avail-tag">{DAYS_SHORT[a.dayOfWeek]} {a.startTime}-{a.endTime}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--gray-100)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>
                  Modifier
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(d)}>
                  {d.isActive ? 'Desactiver' : 'Reactiver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? 'Ajouter un medecin' : 'Modifier le medecin'}</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prenom *</label>
                    <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ex: Mohamed" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Ex: Ben Ali" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Specialite *</label>
                  <input className="form-control" name="specialty" value={form.specialty} onChange={handleChange} placeholder="Ex: Cardiologie" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telephone</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="+216 XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="medecin@clinic.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Biographie</label>
                  <textarea className="form-control" name="bio" value={form.bio} onChange={handleChange} placeholder="Parcours et specialisations..." style={{ minHeight: '80px' }} />
                </div>

                {/* Availability */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Disponibilites</label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addSlot}>+ Ajouter un creneau</button>
                  </div>
                  {form.availability.length === 0 && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                      Aucun creneau defini. Le medecin ne sera pas disponible a la reservation.
                    </p>
                  )}
                  {form.availability.map((slot, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px', background: 'var(--gray-50)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <select className="form-control" value={slot.dayOfWeek} onChange={e => updateSlot(i, 'dayOfWeek', e.target.value)} style={{ fontSize: '0.82rem', padding: '7px 10px' }}>
                        {DAYS.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
                      </select>
                      <input className="form-control" type="time" value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)} style={{ fontSize: '0.82rem', padding: '7px 10px' }} />
                      <input className="form-control" type="time" value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)} style={{ fontSize: '0.82rem', padding: '7px 10px' }} />
                      <select className="form-control" value={slot.slotDurationMinutes} onChange={e => updateSlot(i, 'slotDurationMinutes', e.target.value)} style={{ fontSize: '0.82rem', padding: '7px 10px' }}>
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                      <button type="button" onClick={() => removeSlot(i)} style={{ color: 'var(--red-500)', padding: '4px', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Sauvegarde...' : modal === 'add' ? 'Ajouter' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}