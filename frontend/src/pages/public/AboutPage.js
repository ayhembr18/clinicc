import React from 'react';
import { Link } from 'react-router-dom';

const VALUES = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Securite avant tout',
    desc: 'Nos protocoles rigoureux garantissent la securite de chaque patient a chaque etape de sa prise en charge.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    title: 'Bienveillance',
    desc: 'Chaque patient est accueilli avec empathie et respect. Votre bien-etre emotionnel est aussi important que votre sante physique.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Disponibilite',
    desc: 'Nos urgences sont operationnelles 7 jours sur 7, avec une equipe toujours prete a vous accueillir.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
    title: 'Excellence',
    desc: 'Nous investissons continuellement dans la formation de notre equipe et la modernisation de nos equipements.'
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <a href="/">Accueil</a>
          <span className="breadcrumb-sep">/</span>
          <span>A propos</span>
        </div>
        <h1>A Propos de ClinicUrgence</h1>
        <p>Une clinique privee fondee sur la confiance, l'excellence et le respect du patient.</p>
      </div>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            <div>
              <p className="section-label">Notre mission</p>
              <h2 className="section-title">Mettre la sante a portee de tous</h2>
              <p style={{ color: 'var(--gray-600)', lineHeight: '1.8', marginBottom: '20px' }}>
                Fondee en 2014, ClinicUrgence est nee d'une conviction simple : chaque patient merite d'acceder rapidement a des soins de qualite, sans attente interminable et dans un cadre chaleureux.
              </p>
              <p style={{ color: 'var(--gray-600)', lineHeight: '1.8', marginBottom: '20px' }}>
                Notre clinique rassemble une equipe pluridisciplinaire de medecins specialistes, d'infirmiers et de personnel administratif partageant une meme vision : placer l'humain au coeur de chaque acte medical.
              </p>
              <p style={{ color: 'var(--gray-600)', lineHeight: '1.8' }}>
                Avec plus de 5 000 patients pris en charge et 10 ans d'experience, nous continuons de grandir pour mieux vous servir.
              </p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--green-50), var(--green-100))', borderRadius: 'var(--radius-lg)', padding: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { value: '+5 000', label: 'Patients pris en charge' },
                { value: '15+', label: 'Medecins specialistes' },
                { value: '10', label: "Annees d'experience" },
                { value: '7j/7', label: 'Service d\'urgences' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--green-100)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>{item.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--green-700)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <p className="section-label">Ce qui nous guide</p>
            <h2 className="section-title">Nos valeurs</h2>
          </div>
          <div className="grid-2">
            {VALUES.map((v, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '28px' }}>
                <div className="service-icon" style={{ flexShrink: 0, margin: 0 }}>{v.icon}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--green-900)', marginBottom: '8px' }}>{v.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: '1.7' }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--green-800), var(--green-600))', padding: '80px 24px', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: '16px' }}>
            Pret a prendre rendez-vous ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
            Notre equipe est disponible pour vous accueillir. Reservez votre consultation en ligne en quelques minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/appointment" className="btn btn-primary" style={{ background: 'white', color: 'var(--green-800)', fontWeight: 600 }}>
              Prendre rendez-vous
            </Link>
            <Link to="/contact" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}