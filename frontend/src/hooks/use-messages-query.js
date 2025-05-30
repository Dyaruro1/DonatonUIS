import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useMessagesQuery(roomName) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('room', roomName)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      });
  }, [roomName]);
  return { data: messages };
}
