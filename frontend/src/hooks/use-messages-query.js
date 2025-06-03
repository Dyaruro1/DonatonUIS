import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useMessagesQuery(roomName, prendaId = null, solicitante = null, donanteUsername = null) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Función memoizada para cargar mensajes, evita re-creaciones innecesarias
  const loadMessages = useCallback(async () => {
    if (!roomName) {
      setLoading(false);
      return;
    }

    let query;
    // Si tenemos prendaId y solicitante, buscar por esos criterios más específicos
    if (prendaId && solicitante && roomName) {
      // Buscar mensajes que pertenezcan específicamente a este room
      query = supabase
        .from('messages')
        .select('*')
        .eq('room', roomName) // Filtrar por room específico primero
        .eq('prenda_id', prendaId) // Y que sea de la prenda correcta
        .order('created_at', { ascending: true });
          
      const { data, error } = await query;
      if (error) {
        console.error('Error cargando mensajes:', error);
        setLoading(false);
        return;
      }
      
      // Filtro adicional para asegurar que solo se vean mensajes del chat específico
      const filteredData = data?.filter(msg => {
        // Solo mostrar mensajes que:
        // 1. Tengan el room correcto Y
        // 2. Sean entre el solicitante y el donante específicos
        return msg.room === roomName && (
          (msg.username === solicitante) || 
          (msg.username === donanteUsername)
        );
      }) || [];
      
      setMessages(filteredData);
      setLoading(false);
      return;
    } else {
      // Fallback al método original usando room
      query = supabase
        .from('messages')
        .select('*')
        .eq('room', roomName)
        .order('created_at', { ascending: true });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error cargando mensajes:', error);
      setLoading(false);
    } else if (data) {
      setMessages(data);
      setLoading(false);
    }
  }, [roomName, prendaId, solicitante, donanteUsername]);

  useEffect(() => {
    let subscription;
    let isMounted = true;

    // Cargar mensajes iniciales
    loadMessages();    // Suscripción optimizada - solo escuchar INSERT para nuevos mensajes
    subscription = supabase
      .channel('messages-room-' + roomName)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `room=eq.${roomName}`
        },
        (payload) => {
          if (isMounted && payload.new.room === roomName) {
            // Agregar solo el nuevo mensaje sin recargar todo
            setMessages(prevMessages => {
              // Evitar duplicados
              const messageExists = prevMessages.some(msg => msg.id === payload.new.id);
              if (messageExists) return prevMessages;
              
              // Verificar que sea del chat correcto
              if (prendaId && solicitante && donanteUsername) {
                const isValidMessage = payload.new.room === roomName && (
                  payload.new.username === solicitante || 
                  payload.new.username === donanteUsername
                );
                if (!isValidMessage) return prevMessages;
              }
              
              return [...prevMessages, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [roomName, loadMessages, prendaId, solicitante, donanteUsername]);

  return { data: messages, loading };
}
