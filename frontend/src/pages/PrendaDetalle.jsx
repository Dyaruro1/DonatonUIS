import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PrendaDetalle() {
  const navigate = useNavigate();
  const location = useLocation();
  const prenda = location.state?.prenda;

  if (!prenda) {
    navigate('/feed');
    return null;
  }

  // Mostrar todas las fotos disponibles como miniaturas y principal
  const fotos = [prenda.foto1_url, prenda.foto2_url, prenda.foto3_url].filter(Boolean);
  const mainImage = fotos[0] || '/fondo-uis.jpg';

  // Barra de navegación horizontal
  const handleNav = (route) => {
    navigate(route);
  };

  return (
    <div style={{minHeight: '100vh', background: '#18192b'}}>
      {/* NAVBAR HORIZONTAL */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', marginTop: '1.5rem' }}>
        <button className={`feed-navbar-btn${window.location.pathname === '/feed' || window.location.pathname === '/' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/feed')}>
          <span className="feed-navbar-icon">🧺</span>
          <span className="feed-navbar-label">Prendas</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/donar' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/donar')}>
          <span className="feed-navbar-icon">🤲</span>
          <span className="feed-navbar-label">Donar</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/perfil' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/perfil')}>
          <span className="feed-navbar-icon">👤</span>
          <span className="feed-navbar-label">Perfil</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/ajustes' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/ajustes')}>
          <span className="feed-navbar-icon">⚙️</span>
          <span className="feed-navbar-label">Configuración</span>
        </button>
      </div>
      {/* CONTENIDO DETALLE */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', background: 'transparent', padding: '2.5rem 0'}}>
        <div style={{display: 'flex', gap: '2.5rem', width: '90%', maxWidth: 1100, background: 'transparent'}}>
          {/* Miniaturas */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
            {fotos.map((foto, idx) => (
              <img key={idx} src={foto} alt={`mini-${idx}`} style={{width: 60, height: 60, borderRadius: 12, objectFit: 'cover', border: '3px solid #7ee787', background: '#fff'}} />
            ))}
          </div>
          {/* Imagen principal */}
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={mainImage} alt={prenda.nombre} style={{width: 340, height: 340, objectFit: 'cover', borderRadius: 16, background: '#fff'}} />
          </div>
          {/* Detalles */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
            <h2 style={{color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 0}}>{prenda.nombre}</h2>
            <div style={{color: '#b3b3b3', fontSize: '1rem', marginBottom: 8}}>Publicado por ti</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18}}>
              <div style={{color: '#b3b3b3', fontWeight: 600, fontSize: '1.15rem'}}>Talla <span style={{color: '#5b5be7', fontWeight: 700, marginLeft: 8}}>{prenda.talla}</span></div>
              <div style={{color: '#b3b3b3', fontWeight: 600, fontSize: '1.15rem'}}>Sexo <span style={{color: '#5b5be7', fontWeight: 700, marginLeft: 8}}>{prenda.sexo}</span></div>
              <div style={{color: '#b3b3b3', fontWeight: 600, fontSize: '1.15rem'}}>Uso <span style={{color: '#5b5be7', fontWeight: 700, marginLeft: 8}}>{prenda.uso}</span></div>
            </div>
            <button style={{background: '#21E058', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 0', fontWeight: 700, fontSize: '1.08rem', marginBottom: 12, cursor: 'pointer', width: 220}}
              onClick={() => navigate('/editar-publicacion', { state: { prenda } })}
            >Editar publicación</button>
            <button style={{background: '#ff2d2d', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 0', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', width: 220}}>Eliminar publicación</button>
          </div>
        </div>
        {/* Descripción */}
        <div style={{width: '90%', maxWidth: 1100, marginTop: 32, background: 'transparent'}}>
          <h3 style={{color: '#fff', fontWeight: 700, fontSize: '1.25rem', marginBottom: 8}}>Descripción</h3>
          <div style={{color: '#b3b3b3', fontSize: '1.08rem', lineHeight: 1.6}}>{prenda.descripcion}</div>
        </div>
      </div>
    </div>
  );
}

export default PrendaDetalle;
