import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RealtimeChat } from '../components/realtime-chat';
import { useMessagesQuery } from '../hooks/use-messages-query';
import { getProfileWithToken } from '../services/api';

function ChatDonante() {
  const location = useLocation();
  const navigate = useNavigate();
  const prenda = location.state?.prenda;
  const roomName = prenda?.id?.toString();

  // Mensajes iniciales para el chat
  const { data: messages } = useMessagesQuery(roomName);
  // console.log('DEBUG ChatDonante prenda:', roomName);

  // Obtener username actual y username del donante
  let [username, setUsername] = useState();
  let [userObj, setUserObj] = useState();
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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
        setLoading(false);
      }).catch(() => {
        setUsername('Invitado');
        setUserObj({ name: 'Invitado' });
        setLoading(false);
      });
    }
  }, []);  // Para el campo user, pasar el objeto userObj si existe, si no, solo el username
  const user = userObj ? userObj : { name: username };
  // El userDestino debe ser el username del otro participante del chat (no el propio)
  // Si el usuario actual es el donante, el destino es el username del último solicitante en los mensajes
  let userDestino = '';
  if (messages && messages.length > 0) {
    // Buscar el username más reciente distinto al actual
    const lastOtherMsg = [...messages].reverse().find(m => m.username && m.username !== username);
    if (lastOtherMsg) {
      userDestino = lastOtherMsg.username;
    }
  }
  
  if (!prenda) {
    return (
      <div style={{ color: '#fff', background: '#18192b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>No se encontró la información de la prenda.</h2>
      </div>
    );
  }

  if (loading) {
    return <div style={{ color: '#fff', background: '#18192b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>Cargando chat...</h2></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18192b', color: '#fff', padding: 0 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', marginTop: 24 }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.1rem', margin: '32px 0 18px 0' }}>Chat de la publicación: {prenda.nombre}</h1>
        <RealtimeChat
          roomName={roomName}
          username={username}
          userDestino={userDestino}
          messages={messages}
          actualPrendaId = {prenda.id}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
          <button style={{ background: '#23244a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', minWidth: 80 }} onClick={() => navigate(-1)}>
            Atrás
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatDonante;
