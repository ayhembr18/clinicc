import React, { useState } from 'react';
import api from '../../utils/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.message) {
      setError('Veuillez remplir les champs nom, email et message.');
      return;
    }
    setSending(true);
    try {
      await api.post('/contacts', form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <a href="/">Accueil</a>
          <span className="breadcrumb-sep">/</span>
          <span>Contact</span>
        </div>
        <h1>Nous Contacter</h1>
        <p>Notre equipe est disponible pour repondre a toutes vos questions.</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Info */}
            <div>
              <p className="section-label">Coordonnees</p>
              <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Trouvez-nous facilement</h2>
              <p style={{ color: 'var(--gray-600)', marginBottom: '36px', lineHeight: '1.7' }}>
                Notre clinique est situee au coeur de Tunis, accessible en voiture et en transport en commun.
              </p>

              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: 'Adresse',
                  value: '12 Rue de la Sante, Tunis 1002, Tunisie'
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
                  label: 'Telephone',
                  value: '+216 71 234 567'
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                  label: 'Email',
                  value: 'contact@clinicurgence.tn'
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  label: 'Horaires',
                  value: 'Lundi - Samedi: 08h00 - 20h00 | Dimanche: Urgences uniquement'
                },
              ].map(item => (
                <div key={item.label} className="contact-info-item">
                  <div className="contact-info-icon">{item.icon}</div>
                  <div>
                    <div className="contact-info-label">{item.label}</div>
                    <div className="contact-info-value">{item.value}</div>
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-md)', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-100)', marginTop: '8px' }}>
                <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 8px', display: 'block' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <p style={{ fontSize: '0.88rem' }}>12 Rue de la Sante, Tunis 1002</p>
                  <a href="https://maps.google.com?q=Tunis+Tunisie" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: 'var(--green-600)', textDecoration: 'underline', marginTop: '8px', display: 'block' }}>
                    Ouvrir dans Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ padding: '40px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--green-900)', marginBottom: '24px' }}>
                Envoyer un message
              </h3>

              {sent && (
                <div className="alert alert-success">
                  Votre message a ete envoye avec succes. Nous vous repondrons dans les plus brefs delais.
                </div>
              )}

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom complet *</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Votre nom" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telephone</label>
                    <input className="form-control" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+216 XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sujet</label>
                    <input className="form-control" name="subject" value={form.subject} onChange={handleChange} placeholder="Objet de votre message" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-control" name="message" value={form.message} onChange={handleChange} placeholder="Votre message..." style={{ minHeight: '140px' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={sending}>
                  {sending ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}