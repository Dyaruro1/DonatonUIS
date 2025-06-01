import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useMessagesQuery(roomName) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    let subscription;
    // Consulta inicial
    supabase
      .from('messages')
      .select('*')
      .eq('room', roomName)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      });
    // Suscripción en tiempo real
    subscription = supabase
      .channel('messages-room-' + roomName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `room=eq.${roomName}` },
        (payload) => {
          // Refrescar mensajes al recibir cualquier cambio
          supabase
            .from('messages')
            .select('*')
            .eq('room', roomName)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
              if (data) setMessages(data);
            });
        }
      )
      .subscribe();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [roomName]);
  return { data: messages };
}
