import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useNotifications(userId, limit = 3) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;
    // Cargar notificaciones iniciales
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data) setNotifications(data);
      });
    // Suscripción en tiempo real
    const channel = supabase
      .channel('realtime:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, limit));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit]);

  return notifications;
}
