import React from 'react';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    title: 'Urgences Medicales',
    desc: 'Notre service d\'urgences est operationnel 7j/7 avec une equipe multidisciplinaire prete a intervenir immediatement. Prise en charge de toutes les urgences medicales et chirurgicales.',
    details: ['Triage immediat', 'Medecin present 24h/24', 'Equipement de reanimation', 'Transfer hospitalier si necessaire'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20"/></svg>
  },
  {
    title: 'Cardiologie',
    desc: 'Consultations cardiologiques, electrocardiogrammes, echographies cardiaques, et suivi des patients souffrant de maladies cardiovasculaires.',
    details: ['ECG standard et holter', 'Echocardiographie', 'Test d\'effort', 'Suivi post-infarctus'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
  },
  {
    title: 'Pediatrie',
    desc: 'Soins medicaux adaptes aux nourrissons, enfants et adolescents, avec des medecins formes aux specificites pediatriques.',
    details: ['Consultations 0-18 ans', 'Vaccinations', 'Suivi de croissance', 'Urgences pediatriques'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
  },
  {
    title: 'Radiologie & Imagerie',
    desc: 'Plateau technique moderne pour l\'imagerie medicale diagnostique avec des radiologues disponibles rapidement.',
    details: ['Radiographie numerique', 'Echographie', 'Compte rendu immediat', 'Imagerie osseuse et thoracique'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  },
  {
    title: 'Laboratoire d\'Analyses',
    desc: 'Laboratoire de biologie medicale sur place avec resultats rapides pour une prise en charge sans delai.',
    details: ['NFS, bilan biochimique', 'Bilan coagulation', 'Serologie et bacteriologie', 'Resultat en 2-4 heures'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
  },
  {
    title: 'Chirurgie Ambulatoire',
    desc: 'Interventions chirurgicales programmees en ambulatoire avec bloc operatoire equipee et anesthesiste present.',
    details: ['Chirurgie dermatologique', 'Soins de plaies complexes', 'Petites interventions ORL', 'Suivi post-operatoire'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  },
  {
    title: 'Medecine Generale',
    desc: 'Consultations de medecine generale pour toute la famille, ordonnances, certificats medicaux et suivis de maladies chroniques.',
    details: ['Consultations sans rendez-vous', 'Certificats et ordonnances', 'Suivi maladies chroniques', 'Medecine preventive'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  {
    title: 'Traumatologie',
    desc: 'Prise en charge des traumatismes osseux et musculaires, entorses, fractures et contusions dans les meilleurs delais.',
    details: ['Immobilisation et attelles', 'Reduction de fractures', 'Platre et resine', 'Suivi traumatologique'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
  },
];

export default function ServicesPage() {
  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <a href="/">Accueil</a>
          <span className="breadcrumb-sep">/</span>
          <span>Services</span>
        </div>
        <h1>Nos Services Medicaux</h1>
        <p>Une offre de soins complete pour repondre a tous vos besoins de sante.</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-2">
            {SERVICES.map((s, i) => (
              <div key={i} className="card" style={{ padding: '32px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div className="service-icon" style={{ flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--green-900)', marginBottom: '10px' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: '1.7', marginBottom: '16px' }}>{s.desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {s.details.map((d, j) => (
                      <li key={j} style={{
                        fontSize: '0.8rem', fontWeight: 500, color: 'var(--green-700)',
                        background: 'var(--green-50)', padding: '4px 10px', borderRadius: '100px',
                        border: '1px solid var(--green-100)'
                      }}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px', background: 'linear-gradient(135deg, var(--green-900), var(--green-700))', borderRadius: 'var(--radius-lg)', padding: '48px', textAlign: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: '12px' }}>Besoin d'un rendez-vous ?</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
              Consultez un de nos specialistes des aujourd'hui.
            </p>
            <Link to="/appointment" className="btn btn-primary" style={{ background: 'white', color: 'var(--green-800)', fontWeight: 600 }}>
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}