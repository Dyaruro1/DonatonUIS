import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-bg"></div>
      <div className="home-overlay"></div>
      <div className="home-content">
        <div className="home-left-panel">
          <div className="logo-main">DONATON <span>UIS</span></div>
          <p className="subtitle-logo">Donando ropa para nuestros compañeros</p>
          <h1>¡Bienvenido, estudiante UIS!</h1>
          <p className="main-cta">Dona ropa y ayuda a <span className="highlight">tus compañeros</span></p>
        </div>
        <div className="home-right-panel">
          <h2>¿Cómo comenzar?</h2>
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary btn-lg">Iniciar sesión</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Registrarse</Link>
          </div>
          <div className="footer-links">
            <img src="/logo-pequeno.svg" alt="Logo Pequeño" className="small-logo-footer"/>
            <p>
              <Link to="/terminos">Términos de uso</Link> | <Link to="/privacidad">Política de privacidad</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

