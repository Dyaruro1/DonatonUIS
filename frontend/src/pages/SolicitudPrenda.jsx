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
  console.log('DEBUG SolicitudPrenda prenda:', prenda);
  const roomName = prenda?.id?.toString();
  const [donante, setDonante] = useState(prenda?.donante || null);
  const [now, setNow] = useState(Date.now());

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

  // Mensajes iniciales para el chat
  const { data: messages } = useMessagesQuery(roomName);
  // Obtener username actual y username del donante
  let [username, setUsername] = useState(undefined);
  let [userObj, setUserObj] = useState(undefined);

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
          localStorage.setItem('username', data.username);
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
  }, []);
  // Para el campo user, pasar el objeto userObj si existe, si no, solo el username
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
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          title="Cerrar sesión"
        >
          <i className="fa fa-sign-out-alt" style={{ fontSize: 28 }}></i>
        </button>
      </div>
      {/* PERFIL DONANTE Y CHAT */}
      <div style={{ maxWidth: 900, margin: '0 auto', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'transparent', marginBottom: 0 }}>
          <img src={donante.foto || '/logo-pequeno.svg'} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', background: '#23233a', border: '3px solid #fff' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 700, fontSize: '1.35rem', color: '#fff' }}>{donante.nombre} {donante.apellido}</div>
            <span style={{ background: isOnline(donante.last_active) ? '#21e058' : '#babcc4', color: isOnline(donante.last_active) ? '#fff' : '#23233a', fontWeight: 600, borderRadius: 6, padding: '2px 12px', fontSize: 15, width: 'fit-content', marginBottom: 2 }}>{isOnline(donante.last_active) ? 'En línea' : 'Desconectado'}</span>
            <span style={{ color: '#babcc4', fontSize: 16, marginTop: 2 }}>¡Bienvenido al chat!</span>
          </div>
        </div>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.1rem', margin: '32px 0 18px 0' }}>{prenda.nombre}</h1>
        {/* Espacio para chat */}
        <RealtimeChat
          roomName={roomName}
          username={username}
          user={user}
          userDestino={userDestino}
          messages={messages}
        />
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
