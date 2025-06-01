import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook that monitors incoming messages where the destination user is the current user
 */
export function useMessageNotifications() {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const username = currentUser.username;

    // Fallback: if currentUser doesn't have username, do not proceed
    if (!username) return;

    // Load messages where user_destino is the current username
    supabase
      .from('messages')
      .select('*')
      .eq('user_destino', username)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setNotifications(data);
      });

    // Realtime subscription
    const channel = supabase
      .channel('realtime:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_destino=eq.${username}` }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 3));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  return notifications;
}
