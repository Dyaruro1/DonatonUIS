import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useNotifications(username, limit = 3, roomIds = []) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!username) return;
    // Consultar mensajes donde el usuario es destinatario
    // (Eliminado el bloque que insertaba notificaciones por cada mensaje)
    // Cargar notificaciones iniciales
    supabase
      .from('notifications')
      .select('*')
      .eq('user_destiny', username)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data) setNotifications(data);
      });
    // Suscripción en tiempo real a notificaciones directas
    const notifChannel = supabase
      .channel('realtime:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_destiny=eq.${username}` }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, limit));
      })
      .subscribe();
    // Suscripción en tiempo real a mensajes recibidos
    const msgChannel = supabase
      .channel('realtime:messages-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_destino=eq.${username}` }, async (payload) => {
        // Registrar notificación en la tabla notifications
        await supabase
          .from('notifications')
          .insert({            user_destiny: payload.new.user_destino, // igual que en messages
            user_sender: payload.new.username, // igual que en messages
            prenda_id: payload.new.prenda_id, // o el campo correcto de la prenda
            tipo: 'mensaje',
            texto: `Nuevo mensaje de ${payload.new.username}`,
            message_id: payload.new.id,
            // prenda_id y user_sender deben ser incluidos según tu modelo
          }, { upsert: true })
          .select();
        // Refrescar notificaciones
        supabase
          .from('notifications')
          .select('*')
          .eq('user_destiny', username)
          .order('created_at', { ascending: false })
          .limit(limit)
          .then(({ data }) => {
            if (data) setNotifications(data);
          });
      })
      .subscribe();
    // Suscripciones a todos los rooms (messages)
    const messageChannels = (roomIds || []).map(roomId =>
      supabase
        .channel('messages-room-' + roomId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `room=eq.${roomId}` },
          () => {
            supabase
              .from('notifications')
              .select('*')
              .eq('user_destiny', username)
              .order('created_at', { ascending: false })
              .limit(limit)
              .then(({ data }) => {
                if (data) setNotifications(data);
              });
          }
        )
        .subscribe()
    );
    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(msgChannel);
      messageChannels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [username, limit, JSON.stringify(roomIds)]);

  return notifications;
}
