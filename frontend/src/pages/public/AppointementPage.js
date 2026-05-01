import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const SERVICES = [
  'Urgences Medicales', 'Cardiologie', 'Pediatrie', 'Radiologie & Imagerie',
  'Analyses Medicales', 'Chirurgie Ambulatoire', 'Medecine Generale', 'Traumatologie'
];

function generateTicketPDF(appointment) {
  // Simple HTML print-based ticket
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket de Rendez-vous - ${appointment.ticketNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Georgia, serif; background: #f8fdf9; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        .ticket { background: white; max-width: 500px; width: 100%; border: 2px solid #1f7a4c; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        .ticket-header { background: linear-gradient(135deg, #0d3321, #1f7a4c); color: white; padding: 28px 32px; text-align: center; }
        .clinic-name { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.02em; }
        .clinic-sub { font-size: 0.85rem; opacity: 0.75; margin-top: 4px; }
        .ticket-body { padding: 32px; }
        .ticket-title { font-size: 1rem; color: #4d6358; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; margin-bottom: 20px; text-align: center; }
        .ticket-number { font-size: 2rem; font-weight: 700; color: #1f7a4c; text-align: center; background: #eaf9f0; padding: 12px; border-radius: 8px; margin-bottom: 28px; letter-spacing: 0.05em; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eaf9f0; }
        .row:last-child { border-bottom: none; }
        .row-label { font-size: 0.82rem; color: #8fa89a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .row-value { font-size: 0.92rem; color: #1e2e25; font-weight: 500; text-align: right; max-width: 60%; }
        .ticket-footer { background: #eaf9f0; padding: 20px 32px; text-align: center; font-size: 0.82rem; color: #4d6358; border-top: 1px solid #c8f0da; }
        .status { display: inline-block; padding: 4px 14px; border-radius: 100px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #c8f0da; color: #155234; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="ticket-header">
          <div class="clinic-name">ClinicUrgence</div>
          <div class="clinic-sub">12 Rue de la Sante, Tunis 1002 - Tel: +216 71 234 567</div>
        </div>
        <div class="ticket-body">
          <div class="ticket-title">Confirmation de rendez-vous</div>
          <div class="ticket-number">${appointment.ticketNumber}</div>
          <div class="row"><span class="row-label">Patient</span><span class="row-value">${appointment.firstName} ${appointment.lastName}</span></div>
          <div class="row"><span class="row-label">Telephone</span><span class="row-value">${appointment.phone}</span></div>
          <div class="row"><span class="row-label">Email</span><span class="row-value">${appointment.email}</span></div>
          <div class="row"><span class="row-label">Medecin</span><span class="row-value">${appointment.doctorName}</span></div>
          <div class="row"><span class="row-label">Service</span><span class="row-value">${appointment.service}</span></div>
          <div class="row"><span class="row-label">Date</span><span class="row-value">${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
          <div class="row"><span class="row-label">Heure</span><span class="row-value">${appointment.appointmentTime}</span></div>
          <div class="row"><span class="row-label">Statut</span><span class="row-value"><span class="status status-${appointment.status}">${appointment.status === 'pending' ? 'En attente' : appointment.status === 'confirmed' ? 'Confirme' : 'Annule'}</span></span></div>
        </div>
        <div class="ticket-footer">
          Veuillez vous presenter 15 minutes avant votre rendez-vous.<br/>
          Apportez ce ticket et votre piece d'identite.
        </div>
      </div>
    </body>
    </html>
  `;

  const w = window.open('', '_blank', 'width=600,height=700');
  w.document.write(content);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

export default function AppointmentPage() {
  const [step, setStep] = useState(1); // 1=form, 2=success
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    service: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: ''
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.doctorId && form.appointmentDate) {
      setLoadingSlots(true);
      setForm(f => ({ ...f, appointmentTime: '' }));
      api.get(`/doctors/${form.doctorId}/slots?date=${form.appointmentDate}`)
        .then(r => setSlots(r.data.slots || []))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    } else {
      setSlots([]);
    }
  }, [form.doctorId, form.appointmentDate]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.phone || !form.email ||
        !form.service || !form.doctorId || !form.appointmentDate || !form.appointmentTime) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) {
      setError('Adresse email invalide.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedDoctor = doctors.find(d => d._id === form.doctorId);
      const payload = {
        ...form,
        doctorName: selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : ''
      };
      const res = await api.post('/appointments', payload);
      setAppointment(res.data);
      setStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 2 && appointment) {
    return (
      <>
        <div className="page-hero">
          <h1>Rendez-vous confirme</h1>
          <p>Votre demande a ete enregistree avec succes.</p>
        </div>
        <section className="section">
          <div className="container">
            <div className="ticket-card">
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-900)', marginBottom: '8px' }}>
                Demande enregistree
              </h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.92rem', marginBottom: '4px' }}>
                Votre numero de ticket :
              </p>
              <div className="ticket-number">{appointment.ticketNumber}</div>

              <div style={{ textAlign: 'left', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', padding: '20px', marginBottom: '24px' }}>
                {[
                  ['Patient', `${appointment.firstName} ${appointment.lastName}`],
                  ['Medecin', appointment.doctorName],
                  ['Service', appointment.service],
                  ['Date', new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                  ['Heure', appointment.appointmentTime],
                  ['Telephone', appointment.phone],
                  ['Email', appointment.email],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--green-100)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--gray-600)', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => generateTicketPDF(appointment)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Telecharger le ticket
                </button>
                <button className="btn btn-outline" onClick={() => { setStep(1); setForm({ firstName: '', lastName: '', phone: '', email: '', service: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '' }); }}>
                  Nouveau rendez-vous
                </button>
              </div>

              <p style={{ marginTop: '20px', fontSize: '0.82rem', color: 'var(--gray-400)', lineHeight: '1.6' }}>
                Notre equipe vous contactera sous 24h pour confirmer votre rendez-vous.
                Presentez-vous 15 minutes avant l'heure prevue.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <a href="/">Accueil</a>
          <span className="breadcrumb-sep">/</span>
          <span>Rendez-vous</span>
        </div>
        <h1>Prendre un Rendez-vous</h1>
        <p>Remplissez le formulaire et choisissez votre medecin et creneau.</p>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '40px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-900)', marginBottom: '8px' }}>
                Formulaire de rendez-vous
              </h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '32px' }}>
                Tous les champs marques d'un * sont obligatoires.
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--green-800)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--green-100)' }}>
                  Informations personnelles
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prenom *</label>
                    <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Votre prenom" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Votre nom" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telephone *</label>
                    <input className="form-control" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+216 XX XXX XXX" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" required />
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--green-800)', margin: '8px 0 16px', paddingBottom: '8px', borderBottom: '1px solid var(--green-100)' }}>
                  Details du rendez-vous
                </h3>

                <div className="form-group">
                  <label className="form-label">Service medical *</label>
                  <select className="form-control" name="service" value={form.service} onChange={handleChange} required>
                    <option value="">Selectionnez un service</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Medecin *</label>
                  <select className="form-control" name="doctorId" value={form.doctorId} onChange={handleChange} required>
                    <option value="">Selectionnez un medecin</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.firstName} {d.lastName} — {d.specialty}
                      </option>
                    ))}
                  </select>
                  {doctors.length === 0 && (
                    <p className="form-error">Aucun medecin disponible. Veuillez contacter la clinique.</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date souhaitee *</label>
                    <input className="form-control" name="appointmentDate" type="date" min={today} value={form.appointmentDate} onChange={handleChange} required disabled={!form.doctorId} />
                    {!form.doctorId && <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginTop: '4px' }}>Selectionnez un medecin d'abord</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Creneau horaire *</label>
                    {loadingSlots ? (
                      <div style={{ padding: '12px', color: 'var(--gray-400)', fontSize: '0.88rem' }}>Chargement des creneaux...</div>
                    ) : slots.length > 0 ? (
                      <select className="form-control" name="appointmentTime" value={form.appointmentTime} onChange={handleChange} required>
                        <option value="">Selectionnez un creneau</option>
                        {slots.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : form.doctorId && form.appointmentDate ? (
                      <div style={{ padding: '12px 16px', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--gray-600)' }}>
                        Aucun creneau disponible ce jour. Choisissez une autre date.
                      </div>
                    ) : (
                      <div style={{ padding: '12px 16px', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--gray-400)' }}>
                        Choisissez un medecin et une date
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Motif de consultation</label>
                  <textarea className="form-control" name="reason" value={form.reason} onChange={handleChange} placeholder="Decrivez brievement votre motif de consultation (optionnel)..." />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '8px' }} disabled={submitting}>
                  {submitting ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}