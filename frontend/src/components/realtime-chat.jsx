import React, { useEffect, useRef, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/chat-animations.css';

export function RealtimeChat({ roomName, username, user, userDestino, messages: initialMessages = [], onMessage, actualPrendaId, donanteUsername }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  // Memoizar mensajes para evitar re-renders innecesarios
  const memoizedMessages = useMemo(() => {
    // Si hay initialMessages y tenemos mensajes locales, combinarlos inteligentemente
    if (initialMessages.length > 0 && messages.length > 0) {
      // Crear un Map para evitar duplicados basado en ID
      const messagesMap = new Map();
      
      // Agregar initialMessages primero
      initialMessages.forEach(msg => {
        messagesMap.set(msg.id || `init-${msg.created_at}-${msg.content}`, msg);
      });
      
      // Agregar mensajes locales (nuevos) que no estén ya
      messages.forEach(msg => {
        const key = msg.id || `local-${msg.created_at}-${msg.content}`;
        if (!messagesMap.has(key)) {
          messagesMap.set(key, msg);
        }
      });
      
      // Convertir a array y ordenar por fecha
      return Array.from(messagesMap.values()).sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
    }
    
    // Si solo hay initialMessages, usarlos
    if (initialMessages.length > 0) {
      return initialMessages;
    }
    
    // Si solo hay mensajes locales, usarlos
    return messages;
  }, [initialMessages, messages]);

  // Solo actualizar cuando initialMessages cambien significativamente
  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages.length]);// Solo cuando cambia la longitud

  // Cargar mensajes solo si no hay initialMessages y tenemos roomName
  useEffect(() => {
    if (initialMessages.length === 0 && roomName && messages.length === 0) {
      supabase
        .from('messages')
        .select('*')
        .eq('room', roomName)
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error cargando mensajes:', error);
          } else if (data) {
            const filteredData = data.filter(msg => 
              msg.room === roomName && (
                msg.username === userDestino || 
                msg.username === username ||
                msg.username === donanteUsername
              )
            );
            setMessages(filteredData);
          }
        });
    }
  }, [roomName, userDestino, username, donanteUsername, initialMessages.length]);
  // Suscripción en tiempo real optimizada
  useEffect(() => {
    if (!roomName) return;
    
    const channel = supabase
      .channel('realtime:messages-room-' + roomName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room=eq.${roomName}`
      }, (payload) => {
        // Solo agregar el mensaje si pertenece a este room específico
        if (payload.new.room === roomName) {
          // Actualizar el estado local siempre para mantener sincronización
          setMessages((msgs) => {
            // Evitar duplicados
            const exists = msgs.some(msg => msg.id === payload.new.id);
            if (exists) return msgs;
            return [...msgs, payload.new];
          });
          
          // Notificar al componente padre si tiene callback
          if (onMessage) {
            onMessage(payload.new);
          }
        }
      })
      .subscribe();      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName, onMessage]);

  // Scroll suave optimizado
  useEffect(() => {
    if (bottomRef.current) {
      const scrollTimeout = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100); // Pequeño delay para evitar múltiples scrolls
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [memoizedMessages.length]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Validar actualPrendaId
    if (actualPrendaId === null || actualPrendaId === undefined || isNaN(parseInt(String(actualPrendaId), 10))) {
      console.error(
        'Error crítico: actualPrendaId no es un número válido o no fue proporcionado. ' +
        `Valor recibido: \"${actualPrendaId}\". El mensaje no se enviará.`
      );
      alert(
        'Error: No se pudo asociar este chat con una prenda específica (ID de prenda inválido). El mensaje no fue enviado. ' +
        'Por favor, verifica que la información de la prenda sea correcta.'
      );
      return;
    }

    const messagePayload = {
      room: roomName,
      content: input,
      username: username,
      user_destino: userDestino,
      prenda_id: parseInt(String(actualPrendaId), 10),
    };
    
    // Insertar mensaje en Supabase
    const { error } = await supabase
      .from('messages')
      .insert(messagePayload)
      .select();
      
    if (error) {
      alert('Error al enviar mensaje: ' + error.message);
      return;
    }
    
    setInput('');
  };
  return (
    <div 
      className="chat-container-smooth"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 320, 
        background: '#e3e3e3', 
        borderRadius: 24, 
        boxShadow: '0 2px 16px #0002', 
        position: 'relative', 
        padding: 0,
        opacity: memoizedMessages.length >= 0 ? 1 : 0.8
      }}
    >
      <div 
        className="chat-messages-container"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1.5rem 2.2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 8
        }}
      >
        {memoizedMessages.map((msg, idx) => {
          const isOwn = (msg.user?.name || msg.username) === username;
          return (
            <div
              key={msg.id || `msg-${idx}-${msg.created_at}`}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                className="chat-message-animation"
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
