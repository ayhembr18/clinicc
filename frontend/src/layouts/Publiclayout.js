import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isOpen = () => {
    const now = new Date();
    const h = now.getHours();
    const day = now.getDay();
    return day >= 1 && day <= 6 && h >= 8 && h < 20;
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-cross">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          ClinicUrgence
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end>Accueil</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/team">Equipe</NavLink>
          <NavLink to="/appointment">Rendez-vous</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/about">A propos</NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={`status-indicator ${isOpen() ? 'status-open' : 'status-closed'}`}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOpen() ? 'var(--green-500)' : 'var(--red-500)', display: 'inline-block' }}></span>
            {isOpen() ? 'Ouvert' : 'Ferme'}
          </div>
          <a href="tel:+21671234567" className="btn-emergency">
            <PhoneIcon />
            Urgence
          </a>
          <button className="navbar-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <MenuIcon />
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">ClinicUrgence</div>
          <p className="footer-desc">
            Votre sante, notre priorite. Une clinique privee dediee aux soins d'urgence et aux consultations specialisees, disponible 7j/7.
          </p>
        </div>
        <div className="footer-col">
          <h4>Navigation</h4>
          <Link to="/">Accueil</Link>
          <Link to="/services">Services</Link>
          <Link to="/team">Notre equipe</Link>
          <Link to="/about">A propos</Link>
        </div>
        <div className="footer-col">
          <h4>Patients</h4>
          <Link to="/appointment">Prendre rendez-vous</Link>
          <Link to="/contact">Nous contacter</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <a href="tel:+21671234567">+216 71 234 567</a>
          <a href="mailto:contact@clinicurgence.tn">contact@clinicurgence.tn</a>
          <span>12 Rue de la Sante, Tunis 1002</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>2024 ClinicUrgence. Tous droits reserves.</p>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}