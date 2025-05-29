import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../pages/FeedPrendas.css';

function SolicitudPrenda() {
  const location = useLocation();
  const navigate = useNavigate();
  const prenda = location.state?.prenda;
  const [donante, setDonante] = useState(prenda?.donante || null);
  const [isOnline, setIsOnline] = useState(false);

  // Simula la lógica de online (debería venir de backend en real)
  useEffect(() => {
    if (donante && donante.last_active) {
      const last = new Date(donante.last_active).getTime();
      setIsOnline(Date.now() - last < 2 * 60 * 1000);
    }
  }, [donante]);

  if (!prenda || !donante) {
    return (
      <div style={{ color: '#fff', background: '#18192b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>No se encontró la información de la prenda o donante.</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18192b', color: '#fff', padding: 0 }}>
      {/* NAVBAR HORIZONTAL */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', marginBottom: '1.2rem', width: '100%' }}>
        <button className={`feed-navbar-btn${window.location.pathname === '/feed' || window.location.pathname === '/' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/feed')}>
          <span className="feed-navbar-icon">🧺</span>
          <span className="feed-navbar-label">Prendas</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/donar' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/donar')}>
          <span className="feed-navbar-icon">🤲</span>
          <span className="feed-navbar-label">Donar</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/perfil' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/perfil')}>
          <span className="feed-navbar-icon">👤</span>
          <span className="feed-navbar-label">Perfil</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/ajustes' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/ajustes')}>
          <span className="feed-navbar-icon">⚙️</span>
          <span className="feed-navbar-label">Configuración</span>
        </button>
      </div>
      {/* PERFIL DONANTE Y CHAT */}
      <div style={{ maxWidth: 900, margin: '0 auto', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'transparent', marginBottom: 0 }}>
          <img src={donante.foto || '/logo-pequeno.svg'} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', background: '#23233a', border: '3px solid #fff' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 700, fontSize: '1.35rem', color: '#fff' }}>{donante.nombre} {donante.apellido}</div>
            <span style={{ background: isOnline ? '#21e058' : '#babcc4', color: isOnline ? '#fff' : '#23233a', fontWeight: 600, borderRadius: 6, padding: '2px 12px', fontSize: 15, width: 'fit-content', marginBottom: 2 }}>{isOnline ? 'En línea' : 'Desconectado'}</span>
            <span style={{ color: '#babcc4', fontSize: 16, marginTop: 2 }}>¡Bienvenido al chat!</span>
          </div>
        </div>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.1rem', margin: '32px 0 18px 0' }}>{prenda.nombre}</h1>
        {/* Espacio para chat */}
        <div style={{ background: '#e3e3e3', borderRadius: 24, minHeight: 280, height: 320, marginBottom: 32, padding: 0, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
          {/* Aquí irá la API de mensajería */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0.15, zIndex: 1 }}></div>
          <div style={{ padding: '1.5rem 2.2rem', zIndex: 2, position: 'relative' }}>
            <div style={{ color: '#23233a', fontWeight: 600, fontSize: '1.15rem', marginBottom: 8, background: '#fff', borderRadius: 8, padding: '0.5rem 1.2rem', width: 'fit-content' }}>¡Hola 👋!</div>
            <div style={{ color: '#23233a', fontWeight: 500, fontSize: '1.08rem', marginBottom: 8, background: '#fff', borderRadius: 8, padding: '0.5rem 1.2rem', width: 'fit-content' }}>¿Tienes alguna pregunta?</div>
          </div>
          {/* Input de mensaje (solo UI, no funcional) */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: '#e3e3e3', borderRadius: '0 0 24px 24px', padding: '1.1rem 1.5rem', position: 'absolute', bottom: 0, left: 0 }}>
            <input type="text" placeholder="Escribe un mensaje" style={{ flex: 1, border: 'none', borderRadius: 18, padding: '0.7rem 1.2rem', fontSize: 16, outline: 'none', background: '#fff', color: '#23233a' }} disabled />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} disabled>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="#21e058"/></svg>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button style={{ background: '#23244a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', minWidth: 80 }} onClick={() => navigate(-1)}>
            Atrás
          </button>
        </div>
      </div>
    </div>
  );
}

export default SolicitudPrenda;
