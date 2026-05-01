import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function TeamPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <a href="/">Accueil</a>
          <span className="breadcrumb-sep">/</span>
          <span>Notre equipe</span>
        </div>
        <h1>Notre Equipe Medicale</h1>
        <p>Des professionnels de sante qualifies et devoues a votre service.</p>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}><div className="loader" style={{ margin: '0 auto' }}></div></div>
          ) : doctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <p>L'equipe medicale sera affichee ici.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Connectez-vous a l'espace administrateur pour ajouter des medecins.</p>
            </div>
          ) : (
            <div className="grid-3">
              {doctors.map(d => (
                <div key={d._id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{
                    height: '200px', background: 'linear-gradient(135deg, var(--green-100), var(--green-200))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--green-600)'
                  }}>
                    {d.firstName[0]}{d.lastName[0]}
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--green-900)', marginBottom: '4px' }}>
                      Dr. {d.firstName} {d.lastName}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-500)', marginBottom: '12px' }}>
                      {d.specialty}
                    </div>
                    {d.bio && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: '1.7', marginBottom: '16px' }}>{d.bio}</p>
                    )}

                    {d.availability && d.availability.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--green-100)' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: '10px' }}>
                          Disponibilites
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {d.availability.map((a, i) => (
                            <div key={i} style={{
                              fontSize: '0.78rem', background: 'var(--green-50)', color: 'var(--green-700)',
                              padding: '3px 10px', borderRadius: '100px', border: '1px solid var(--green-100)'
                            }}>
                              {DAYS[a.dayOfWeek]} {a.startTime}-{a.endTime}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {d.email && (
                      <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {d.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}