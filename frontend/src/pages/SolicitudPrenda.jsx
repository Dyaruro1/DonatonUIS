import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../pages/FeedPrendas.css';
import { RealtimeChat } from '../components/realtime-chat';
import { useMessagesQuery } from '../hooks/use-messages-query';
import { getProfileWithToken } from '../services/api';

function SolicitudPrenda() {
  const location = useLocation();
  const navigate = useNavigate();
  const prenda = location.state?.prenda;
  const [donante, setDonante] = useState(prenda?.donante || null);
  const [now, setNow] = useState(Date.now());
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Lógica para saber si el donante está en línea (última actividad < 2 minutos)
  const isOnline = (lastActive) => {
    if (!lastActive) return false;
    const last = new Date(lastActive).getTime();
    return now - last < 2 * 60 * 1000;
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Guardar info global para notificaciones en el chat
  useEffect(() => {
    window.currentUser = prenda?.solicitante || null;
    window.donanteId = donante?.id;
    window.prendaNombre = prenda?.nombre;
  }, [prenda, donante]);
  // Obtener username actual y username del donante
  let [username, setUsername] = useState(undefined);
  let [userObj, setUserObj] = useState(undefined);  // El roomName se genera dinámicamente después de obtener el username
  const roomName = prenda?.id && username ? `${prenda.id}${username}` : prenda?.id?.toString();
    // Mensajes iniciales para el chat - usando parámetros actualizados
  const { data: messages, loading: messagesLoading } = useMessagesQuery(
    roomName, 
    prenda?.id, 
    username, 
    prenda?.donante?.username || prenda?.donante?.nombre || ''
  );

  useEffect(() => {
    let localUserObj;
    let localUsername;
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        localUserObj = JSON.parse(userStr);
        if (localUserObj && localUserObj.username) localUsername = localUserObj.username;
      }
      if (!localUsername) {
        const fallback = localStorage.getItem('username');
        if (fallback) localUsername = fallback;
      }
    } catch (e) {
      localUsername = localStorage.getItem('username');
    }
    if (localUsername && localUsername !== 'Invitado') {
      setUsername(localUsername);
      setUserObj(localUserObj ? { name: localUserObj.username, ...localUserObj } : { name: localUsername });
    } else {
      // Si no hay username válido, pedirlo al backend usando el token
      getProfileWithToken().then(res => {
        const data = res.data;
        if (data && data.username) {
          setUsername(data.username);
          setUserObj({ name: data.username, ...data });
          // Opcional: guardar en localStorage para futuras sesiones
          // localStorage.setItem('username', data.username);
          // localStorage.setItem('currentUser', JSON.stringify(data));
        } else {
          setUsername('Invitado');
          setUserObj({ name: 'Invitado' });
        }
      }).catch(() => {
        setUsername('Invitado');
        setUserObj({ name: 'Invitado' });
      });
    }
  }, []);  // Para el campo user, pasar el objeto userObj si existe, si no, solo el username
  const user = userObj ? userObj : { name: username };
  const userDestino = prenda?.donante?.username || prenda?.donante?.nombre || '';

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
      {/* PERFIL DONANTE Y CHAT */}
      <div style={{ maxWidth: 900, margin: '0 auto', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'transparent', marginBottom: 0 }}>
          <img src={donante.foto || '/logo-pequeno.svg'} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', background: '#23233a', border: '3px solid #fff' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 700, fontSize: '1.35rem', color: '#fff' }}>{donante.nombre} {donante.apellido}</div>
            <span style={{ background: isOnline(donante.last_active) ? '#21e058' : '#babcc4', color: isOnline(donante.last_active) ? '#fff' : '#23233a', fontWeight: 600, borderRadius: 6, padding: '2px 12px', fontSize: 15, width: 'fit-content', marginBottom: 2 }}>{isOnline(donante.last_active) ? 'En línea' : 'Desconectado'}</span>
            <span style={{ color: '#babcc4', fontSize: 16, marginTop: 2 }}>¡Bienvenido al chat!</span>
          </div>
        </div>        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.1rem', margin: '32px 0 18px 0' }}>{prenda.nombre}</h1>
        
        {/* Indicador de carga de mensajes */}
        {messagesLoading && (
          <div style={{ 
            color: '#7ee787', 
            fontSize: '1rem', 
            textAlign: 'center', 
            margin: '1rem 0',
            fontWeight: 500 
          }}>
            Cargando conversación...
          </div>
        )}
        
        {/* Espacio para chat */}
        <RealtimeChat
          roomName={roomName}
          username={username}
          user={user}
          userDestino={userDestino}
          messages={messages}
          actualPrendaId = {prenda.id}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24  }}>
          <button style={{ background: '#23244a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', minWidth: 80 }} onClick={() => navigate(-1)}>
            Atrás
          </button>
        </div>
      </div>
    </div>
  );
}

export default SolicitudPrenda;
