import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useNotifications(username, limit = 3, roomIds = []) {
  const [notifications, setNotifications] = useState([]);

  // Función para marcar una notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error al marcar notificación como leída:', error);
        return false;
      }

      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      
      console.log('✅ Notificación marcada como leída:', notificationId);
      return true;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!username) return;
    // Cargar solo notificaciones no leídas
    supabase
      .from('notifications')
      .select('*')
      .eq('user_destiny', username)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data) setNotifications(data);
      });
    // Suscripción en tiempo real a notificaciones directas
    const notifChannel = supabase
      .channel('realtime:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_destiny=eq.${username}` }, (payload) => {
        // Refrescar solo no leídas
        supabase
          .from('notifications')
          .select('*')
          .eq('user_destiny', username)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(limit)
          .then(({ data }) => {
            if (data) setNotifications(data);
          });
      })
      .subscribe();
    // Suscripción en tiempo real a mensajes recibidos
    const msgChannel = supabase
      .channel('realtime:messages-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_destino=eq.${username}` }, async (payload) => {
        // console.log('🔔 NOTIF DEBUG: Nuevo mensaje recibido para crear notificación:', payload.new);
        // console.log('🔔 NOTIF DEBUG: Filtro aplicado - user_destino=eq.' + username);        
        const notificationData = {
          user_destiny: payload.new.user_destino, // igual que en messages
          user_sender: payload.new.username, // igual que en messages
          prenda_id: payload.new.prenda_id, // o el campo correcto de la prenda
          read: false, // nueva notificación, no leída
          created_at: new Date().toISOString(), // timestamp requerido por Supabase
        };
        
        // console.log('🔔 NOTIF DEBUG: Datos de notificación a insertar:', notificationData);
        
        // Registrar notificación en la tabla notifications
        const { data: notifResult, error: notifError } = await supabase
          .from('notifications')
          .insert(notificationData, { upsert: true })
          .select();
          
        // console.log('🔔 NOTIF DEBUG: Resultado de inserción en notifications:', { data: notifResult, error: notifError });
        // Refrescar notificaciones
        supabase
          .from('notifications')
          .select('*')
          .eq('user_destiny', username)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(limit)
          .then(({ data }) => {
            if (data) setNotifications(data);
          });

        supabase
          .from('notifications')
          .insert(notificationData, { upsert: true })
          .select();
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
              .eq('read', false)
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
