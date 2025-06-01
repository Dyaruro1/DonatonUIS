import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

export function RealtimeChat({ roomName, username, user, userDestino, messages: initialMessages = [], onMessage, actualPrendaId }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  console.log('DEBUG RealtimeChat roomName:', roomName, 'username:', username, 'userDestino:', userDestino, 'actualPrendaId:', actualPrendaId);
  // Load initial messages if not provided
  useEffect(() => {
    if (initialMessages.length === 0) {
      supabase
        .from('messages')
        .select('*')
        .eq('room', roomName)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) setMessages(data);
        });
    }
  }, [roomName, initialMessages]);

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel('realtime:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${roomName}` }, (payload) => {
        setMessages((msgs) => [...msgs, payload.new]);
        if (onMessage) onMessage([...messages, payload.new]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName, onMessage, messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ya no se deriva prendaId de roomName. Se usa la prop 'actualPrendaId'.
    // Validar que actualPrendaId sea un número válido.
    if (actualPrendaId === null || actualPrendaId === undefined || isNaN(parseInt(String(actualPrendaId), 10))) {
      console.error(
        'Error crítico: actualPrendaId no es un número válido o no fue proporcionado. ' +
        `Valor recibido: \"${actualPrendaId}\". El mensaje no se enviará.`
      );
      alert(
        'Error: No se pudo asociar este chat con una prenda específica (ID de prenda inválido). El mensaje no fue enviado. ' +
        'Por favor, verifica que la información de la prenda sea correcta.'
      );
      return; // Detener la ejecución si actualPrendaId no es válido
    }
      const messagePayload = {
      room: roomName, // roomName es la cadena que identifica la sala de chat
      content: input,
      username: username, // nombre real del usuario (sender)
      user_destino: userDestino, // recipient
      prenda_id: parseInt(String(actualPrendaId), 10), // Usar la prop directa, asegurando que sea un entero
    };
    
    console.log('💬 MESSAGE DEBUG: Enviando mensaje con payload:', messagePayload);
    
    // Solo insertar el mensaje en Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert(messagePayload)
      .select();
      
    console.log('💬 MESSAGE DEBUG: Resultado de inserción en messages:', { data, error });
    if (error) {
      alert('Error al enviar mensaje: ' + error.message);
      return;
    }
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 320, background: '#e3e3e3', borderRadius: 24, boxShadow: '0 2px 16px #0002', position: 'relative', padding: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.2rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg, idx) => {
          const isOwn = (msg.user?.name || msg.username) === username;
          return (
            <div
              key={msg.id || idx}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  background: isOwn ? '#21e058' : '#fff',
                  color: isOwn ? '#fff' : '#23233a',
                  fontWeight: isOwn ? 700 : 500,
                  borderRadius: 12,
                  padding: '0.7rem 1.4rem',
                  minWidth: 60,
                  maxWidth: '60%',
                  boxShadow: isOwn ? '0 2px 8px #21e05833' : '0 2px 8px #0001',
                  alignSelf: isOwn ? 'flex-end' : 'flex-start',
                  textAlign: 'left',
                  marginLeft: isOwn ? 'auto' : 0,
                  marginRight: isOwn ? 0 : 'auto',
                  marginTop: 2,
                  marginBottom: 2,
                  display: 'inline-block',
                  wordBreak: 'break-word',
                }}
              >
                <span style={{ color: isOwn ? '#fff' : '#21e058', marginRight: 8, fontWeight: 600 }}>
                  {msg.user?.name || msg.username}
                </span>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: '0.5rem',
        paddingTop: '1.1rem',
        paddingBottom: '1.1rem',
        paddingLeft: 0,
        paddingRight: 0,
        background: '#e3e3e3',
        borderRadius: '0 0 24px 24px',
        marginTop: 'auto',
        width: '100%',
        minWidth: 0,
      }}>
        <input
          type="text"
          placeholder="Escribe un mensaje"
          style={{
            flex: '1 1 0',
            width: '100%',
            border: 'none',
            borderRadius: 18,
            padding: '0.7rem 1.2rem',
            fontSize: 16,
            outline: 'none',
            background: '#fff',
            color: '#23233a',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" style={{
          flex: '0 0 auto',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="#21e058"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
