import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../pages/FeedPrendas.css';

function PrendaPublicaDetalle() {
  const location = useLocation();
  const navigate = useNavigate();
  const prenda = location.state?.prenda;

  if (!prenda) {
    navigate('/feed');
    return null;
  }

  // Miniaturas: si hay varias imágenes
  const imagenes = prenda.imagenes || [prenda.imagen_url || '/fondo-uis.jpg'];
  const [imgSeleccionada, setImgSeleccionada] = React.useState(imagenes[0]);

  return (
    <div style={{ minHeight: '100vh', background: '#18192b', padding: 0 }}>
      {/* BOTONES DE NAVEGACIÓN SUPERIOR */}
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
      {/* Contenido principal */}
      <div style={{ display: 'flex', gap: '2.5rem', width: '90%', maxWidth: 1100, margin: '0 auto', background: 'transparent' }}>
        {/* Miniaturas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {imagenes.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`miniatura-${idx}`}
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                objectFit: 'cover',
                border: imgSeleccionada === img ? '3px solid #7ee787' : '3px solid transparent',
                background: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => setImgSeleccionada(img)}
            />
          ))}
        </div>
        {/* Imagen principal */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={imgSeleccionada} alt={prenda.nombre} style={{ width: 420, height: 340, objectFit: 'cover', borderRadius: 16, background: '#fff' }} />
        </div>
        {/* Detalles */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 0 }}>{prenda.nombre}</h2>
          <div style={{ color: '#babcc4', fontSize: '1rem', marginBottom: 8 }}>Publicado por {prenda.usuario_nombre || 'Usuario'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.15rem' }}>Talla <span style={{ color: '#5b5be7', fontWeight: 700, marginLeft: 8 }}>{prenda.talla}</span></div>
            <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.15rem' }}>Sexo <span style={{ color: '#5b5be7', fontWeight: 700, marginLeft: 8 }}>{prenda.sexo}</span></div>
            <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.15rem' }}>Uso <span style={{ color: '#5b5be7', fontWeight: 700, marginLeft: 8 }}>{prenda.uso}</span></div>
          </div>
          <button style={{ background: '#21E058', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 0', fontWeight: 700, fontSize: '1.08rem', marginBottom: 12, cursor: 'pointer', width: 220 }}>
            Solicitar prenda
          </button>
        </div>
      </div>
      {/* Descripción y botones pequeños alineados a la derecha */}
      <div style={{ width: '90%', maxWidth: 1100, margin: '2.5rem auto 0 auto', background: 'transparent', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', marginBottom: 8 }}>Descripción</h3>
          <div style={{ color: '#babcc4', fontSize: '1.08rem', lineHeight: 1.6 }}>{prenda.descripcion}</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <button style={{ background: '#0d1b36', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', minWidth: 120, marginTop: 8 }}>
            Denunciar publicación
          </button>
          <button style={{ background: '#23244a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', minWidth: 80, marginTop: 8 }} onClick={() => navigate(-1)}>
            Atrás
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrendaPublicaDetalle;
