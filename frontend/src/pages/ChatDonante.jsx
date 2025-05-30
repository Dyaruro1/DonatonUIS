import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RealtimeChat } from '../components/realtime-chat';
import { useMessagesQuery } from '../hooks/use-messages-query';

function ChatDonante() {
  const location = useLocation();
  const navigate = useNavigate();
  const prenda = location.state?.prenda;
  console.log('DEBUG ChatDonante prenda:', prenda);
  const roomName = prenda?.id?.toString();
  const { data: messages } = useMessagesQuery(roomName);
  const username = localStorage.getItem('username') || 'Donante';

  if (!prenda) {
    return (
      <div style={{ color: '#fff', background: '#18192b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>No se encontró la información de la prenda.</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18192b', color: '#fff', padding: 0 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', marginTop: 24 }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.1rem', margin: '32px 0 18px 0' }}>Chat de la publicación: {prenda.nombre}</h1>
        <RealtimeChat
          roomName={roomName}
          username={username}
          messages={messages}
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
