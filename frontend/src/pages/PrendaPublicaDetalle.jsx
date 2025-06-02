import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../pages/FeedPrendas.css';

function PrendaPublicaDetalle() {
  const location = useLocation();
  const navigate = useNavigate();
  const prenda = location.state?.prenda;

  const [showReportModal, setShowReportModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!prenda) {
    navigate('/feed');
    return null;
  }

  // Obtener todas las imágenes disponibles (foto1_url, foto2_url, foto3_url, fallback a foto1, foto2, foto3)
  const fotos = [
    prenda.foto1_url || prenda.foto1,
    prenda.foto2_url || prenda.foto2,
    prenda.foto3_url || prenda.foto3
  ].filter(Boolean);

  // Si no hay imágenes, usar el fondo por defecto
  const imagenes = fotos.length > 0 ? fotos : ['/fondo-uis.jpg'];
  const [imgSeleccionada, setImgSeleccionada] = React.useState(imagenes[0]);

  React.useEffect(() => {
    setImgSeleccionada(imagenes[0]);
  }, [prenda]);

  // Formatear fecha de publicación
  let fechaPublicacion = '';
  if (prenda.fecha_publicacion) {
    const fecha = new Date(prenda.fecha_publicacion);
    fechaPublicacion = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Obtener nombre del donante
  const nombreDonante = prenda.donante?.username || prenda.donante?.nombre || prenda.usuario_nombre || 'Usuario';

  // Función para enviar la denuncia (conecta con el backend Django)
  const handleReport = async () => {
    try {
      // Cambia la URL para apuntar al backend Django (por ejemplo, puerto 8000)
      const response = await fetch('http://localhost:8000/api/denunciar-prenda/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prendaId: prenda.id,
          motivo,
          prendaNombre: prenda.nombre,
          prendaTalla: prenda.talla,
          prendaSexo: prenda.sexo,
          prendaEstado: prenda.status,
        }),
      });
      if (response.ok) {
        setShowReportModal(false);
        setMotivo('');
        setConfirmMsg('¡Denuncia enviada! Los administradores han sido notificados.');
      } else {
        setShowReportModal(false);
        setConfirmMsg('Error al enviar la denuncia. Intenta de nuevo.');
      }
    } catch (e) {
      setShowReportModal(false);
      setConfirmMsg('Error al enviar la denuncia. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#18192b', padding: 0 }}>
      {/* BOTONES DE NAVEGACIÓN SUPERIOR */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', marginBottom: '1.2rem', width: '100%' }}>
        <button className={`feed-navbar-btn feed-navbar-btn-active`} style={{ background: '#21e058', color: '#18192b' }} onClick={() => navigate('/feed')}>
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
        <button
          className="feed-navbar-btn feed-navbar-btn-logout"
          style={{ background: 'transparent', color: '#ff6b6b', border: 'none', borderRadius: '50%', padding: '0.7rem', fontWeight: 600, fontSize: '1.55rem', marginLeft: '2.5rem', cursor: 'pointer' }}
          onClick={() => setShowLogoutModal(true)}
          title="Cerrar sesión"
        >
          <i className="fa fa-sign-out-alt" style={{ fontSize: 28 }}></i>
        </button>
      </div>
      {/* MODAL DE CONFIRMACIÓN LOGOUT */}
      {showLogoutModal && (
        <>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(24,25,43,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
          }}></div>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 201,
          }}>
            <div style={{
              background: '#23233a',
              borderRadius: 18,
              boxShadow: '0 2px 32px 0 #0004',
              padding: '2.2rem 2.5rem 2rem 2.5rem',
              minWidth: 340,
              maxWidth: 400,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ff3b3b', fontWeight: 700, fontSize: '1.18rem', marginBottom: 10 }}>
                ¿Seguro que deseas cerrar sesión?
              </div>
              <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
                Se cerrará tu sesión y perderás el acceso temporal a tu cuenta. Puedes volver a iniciar sesión cuando lo necesites.
              </div>
              <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>
                <button
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  Sí
                </button>
                <button
                  style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => setShowLogoutModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
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
          <div style={{ color: '#babcc4', fontSize: '1rem', marginBottom: 8 }}>Publicado por <b>{nombreDonante}</b></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.15rem' }}>Talla <span style={{ color: '#5b5be7', fontWeight: 700, marginLeft: 8 }}>{prenda.talla}</span></div>
            <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.15rem' }}>Sexo <span style={{ color: '#5b5be7', fontWeight: 700, marginLeft: 8 }}>{prenda.sexo}</span></div>
            <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.15rem' }}>Uso <span style={{ color: '#5b5be7', fontWeight: 700, marginLeft: 8 }}>{prenda.uso}</span></div>
            {/* Mostrar estado de la prenda */}
            <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.15rem' }}>Estado <span style={{ color: prenda.status === 'disponible' ? '#21E058' : '#ffb300', fontWeight: 700, marginLeft: 8 }}>
              {prenda.status === 'disponible' ? 'Disponible' : prenda.status === 'en_solicitud' ? 'En solicitud' : prenda.status}
            </span></div>
            {fechaPublicacion && (
              <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.08rem' }}>Fecha de publicación <span style={{ color: '#5b5be7', fontWeight: 700, marginLeft: 8 }}>{fechaPublicacion}</span></div>
            )}
          </div>
          <button style={{ background: '#21E058', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 0', fontWeight: 700, fontSize: '1.08rem', marginBottom: 12, cursor: 'pointer', width: 220 }}
            onClick={() => navigate('/solicitacion-prenda', { state: { prenda } })}>
            Solicitar prenda
          </button>
        </div>
      </div>
      {/* Descripción y botones pequeños alineados a la derecha */}
      <div style={{ width: '90%', maxWidth: 1100, margin: '2.5rem auto 0 auto', background: 'transparent', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', marginBottom: 8 }}>Descripción</h3>
          <div style={{ color: '#babcc4', fontSize: '1.08rem', lineHeight: 1.6 }}>
            {prenda.descripcion !== undefined && prenda.descripcion !== null && prenda.descripcion !== ''
              ? prenda.descripcion
              : <span style={{color:'#ff6b6b'}}>Sin descripción</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <button style={{ background: '#0d1b36', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', minWidth: 120, marginTop: 8 }}
            onClick={() => setShowReportModal(true)}>
            Denunciar publicación
          </button>
          <button style={{ background: '#23244a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', minWidth: 80, marginTop: 8 }} onClick={() => navigate(-1)}>
            Atrás
          </button>
        </div>
      </div>
      {/* MODAL DE DENUNCIA */}
      {showReportModal && (
        <>
          <div style={{
            position: 'fixed',
            left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(24,25,43,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 200
          }} />
          <div style={{
            position: 'fixed',
            left: 0, top: 0, width: '100vw', height: '100vh',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 201
          }}>
            <div style={{
              background: '#23233a',
              borderRadius: 18,
              boxShadow: '0 2px 32px 0 #0004',
              padding: '2.2rem 2.5rem 2rem 2.5rem',
              minWidth: 340, maxWidth: 400, width: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <img src={prenda.foto1_url || prenda.foto1} alt={prenda.nombre} style={{ width: 90, borderRadius: 8, marginBottom: 12 }} />
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.18rem', marginBottom: 6 }}>{prenda.nombre}</div>
              <div style={{ color: '#babcc4', marginBottom: 8 }}>
                Talla: <b>{prenda.talla}</b> | Sexo: <b>{prenda.sexo}</b> | Estado: <b>{prenda.status}</b>
              </div>
              <textarea
                placeholder="Describe el motivo de la denuncia..."
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                style={{
                  width: '100%', minHeight: 70, borderRadius: 8, border: '1px solid #444', marginBottom: 18, padding: 8, fontSize: 15
                }}
              />
              <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                <button
                  style={{ flex: 1, background: '#0d1b36', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 0', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setShowReportModal(false)}
                >Cancelar</button>
                <button
                  style={{ flex: 1, background: '#ff3b3b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 0', fontWeight: 600, cursor: 'pointer' }}
                  onClick={handleReport}
                  disabled={!motivo.trim()}
                >Denunciar</button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* MENSAJE DE CONFIRMACIÓN */}
      {confirmMsg && (
        <div style={{
          position: 'fixed', top: 30, left: '50%', transform: 'translateX(-50%)',
          background: '#23233a', color: '#fff', padding: '1rem 2rem', borderRadius: 10, zIndex: 300, fontWeight: 600
        }}>
          {confirmMsg}
          <button style={{ marginLeft: 16, background: 'none', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => setConfirmMsg('')}>X</button>
        </div>
      )}
    </div>
  );
}

export default PrendaPublicaDetalle;
