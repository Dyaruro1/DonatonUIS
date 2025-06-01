import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function AnimatedText() {
  const texts = ["tus compañeros", "tus amigos", "tu comunidad UIS"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayTexts, setDisplayTexts] = useState([
    { text: texts[0], state: 'current', key: 0 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Preparar el siguiente texto
      const nextIndex = (currentIndex + 1) % texts.length;
      const nextKey = Date.now();
      
      // Agregar el nuevo texto que entra desde arriba
      setDisplayTexts(prev => [
        { ...prev[0], state: 'exiting' }, // El actual se va hacia abajo
        { text: texts[nextIndex], state: 'entering', key: nextKey } // El nuevo entra desde arriba
      ]);
      
      // Después de la animación, limpiar y preparar para el siguiente
      setTimeout(() => {
        setDisplayTexts([
          { text: texts[nextIndex], state: 'current', key: nextKey }
        ]);
        setCurrentIndex(nextIndex);
        setIsAnimating(false);
      }, 600); // Duración de la animación
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, texts]);

  return (
    <span className="highlight animated-text">
      {displayTexts.map((item) => (
        <span
          key={item.key}
          className={`text-item ${item.state}`}
        >
          {item.text}
        </span>
      ))}
    </span>
  );
}

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
          <p className="main-cta">Dona ropa y ayuda a <AnimatedText /></p>
        </div>
        <div className="home-right-panel">
          <h2>¿Cómo comenzar?</h2>
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary btn-lg">Iniciar sesión</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Registrarse</Link>
          </div>
          <div className="footer-links">
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <img src="/logo-pequeno.svg" alt="Logo Pequeño" className="small-logo-footer" style={{ display: 'block', margin: '0 auto' }} />
            </div>
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

