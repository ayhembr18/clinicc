import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const SERVICES = [
  {
    title: 'Urgences',
    desc: 'Prise en charge immediate 7j/7 pour toute situation d\'urgence medicale avec une equipe disponible en permanence.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M2 12h20"/>
      </svg>
    )
  },
  {
    title: 'Cardiologie',
    desc: 'Diagnostics cardiaques avances, ECG, echocardiographies et suivi des pathologies cardiovasculaires.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    )
  },
  {
    title: 'Pediatrie',
    desc: 'Soins specialises pour nourrissons, enfants et adolescents, vaccinations et suivis de croissance.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
      </svg>
    )
  },
  {
    title: 'Radiologie',
    desc: 'Radiographies, echographies et imagerie medicale de pointe pour un diagnostic precis.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    )
  },
  {
    title: 'Analyses Medicales',
    desc: 'Laboratoire de biologie medicale avec resultats rapides pour une prise en charge optimale.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    )
  },
  {
    title: 'Chirurgie Ambulatoire',
    desc: 'Interventions chirurgicales mineures et soins post-operatoires dans un cadre securise et moderne.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    )
  },
];

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data.slice(0, 3))).catch(() => {}).finally(() => setLoadingDoctors(false));
  }, []);

  const isOpen = () => {
    const now = new Date();
    const h = now.getHours();
    const day = now.getDay();
    return day >= 1 && day <= 6 && h >= 8 && h < 20;
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Clinique privee d'urgence — Tunis
          </div>

          <h1>
            Des soins d'urgence<br />
            <span>a la hauteur</span> de votre sante
          </h1>

          <p className="hero-sub">
            Une equipe medicale multidisciplinaire disponible 7j/7 pour vous accueillir, vous soigner et assurer votre suivi en toute securite.
          </p>

          <div className="hero-actions">
            <Link to="/appointment" className="btn btn-primary" style={{ background: 'white', color: 'var(--green-800)', fontWeight: 600 }}>
              Prendre rendez-vous
            </Link>
            <Link to="/services" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
              Nos services
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-value">+5000</div>
              <div className="hero-stat-label">Patients traites</div>
            </div>
            <div>
              <div className="hero-stat-value">15+</div>
              <div className="hero-stat-label">Medecins specialistes</div>
            </div>
            <div>
              <div className="hero-stat-value">24h</div>
              <div className="hero-stat-label">Service d'urgences</div>
            </div>
            <div>
              <div className="hero-stat-value">10</div>
              <div className="hero-stat-label">Ans d'experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATUS BANNER */}
      <section style={{ background: isOpen() ? 'var(--green-50)' : '#fff5f5', padding: '20px 24px', borderBottom: '1px solid ' + (isOpen() ? 'var(--green-100)' : '#fed7d7') }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className={`status-indicator ${isOpen() ? 'status-open' : 'status-closed'}`}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOpen() ? 'var(--green-500)' : 'var(--red-500)', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              {isOpen() ? 'Clinique actuellement ouverte' : 'Clinique actuellement fermee'}
            </div>
            <span style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>
              Heures d'ouverture: Lundi-Samedi, 08h00 - 20h00
            </span>
          </div>
          <a href="tel:+21671234567" className="btn btn-sm btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            +216 71 234 567
          </a>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <p className="section-label">Ce que nous proposons</p>
            <h2 className="section-title">Nos services medicaux</h2>
            <p className="section-subtitle">Une gamme complete de services medicaux pour repondre a tous vos besoins de sante.</p>
          </div>
          <div className="grid-3">
            {SERVICES.map((s, i) => (
              <div key={i} className="card service-card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/services" className="btn btn-outline">Voir tous les services</Link>
          </div>
        </div>
      </section>

      {/* TEAM PREVIEW */}
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <p className="section-label">Notre equipe</p>
            <h2 className="section-title">Des medecins specialises</h2>
            <p className="section-subtitle">Une equipe de praticiens qualifies et experimentes a votre service.</p>
          </div>

          {loadingDoctors ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>Chargement...</div>
          ) : doctors.length > 0 ? (
            <div className="grid-3">
              {doctors.map(d => (
                <div key={d._id} className="card doctor-card">
                  <div className="doctor-card-img-placeholder">
                    {d.firstName[0]}{d.lastName[0]}
                  </div>
                  <div className="doctor-card-body">
                    <div className="doctor-card-name">Dr. {d.firstName} {d.lastName}</div>
                    <div className="doctor-card-specialty">{d.specialty}</div>
                    {d.bio && <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginTop: '10px', lineHeight: '1.6' }}>{d.bio.substring(0, 100)}...</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
              Les fiches medecins seront affichees ici.
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/team" className="btn btn-outline">Voir toute l'equipe</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--green-800), var(--green-600))', padding: '80px 24px', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginBottom: '16px' }}>
            Prenez rendez-vous en quelques clics
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '36px', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 36px' }}>
            Selectionnez un medecin, choisissez votre creneau et recevez un ticket de confirmation.
          </p>
          <Link to="/appointment" className="btn btn-primary" style={{ background: 'white', color: 'var(--green-800)', fontWeight: 600, fontSize: '1rem', padding: '14px 36px' }}>
            Reserver maintenant
          </Link>
        </div>
      </section>
    </>
  );
}