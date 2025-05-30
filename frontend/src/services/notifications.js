// Lógica para crear una notificación en Supabase
import { supabase } from '../supabaseClient';

export async function createNotification({ user_id, sender_id, prenda_id, message }) {
  return supabase.from('notifications').insert({
    user_id,
    sender_id,
    prenda_id,
    message,
    read: false,
    created_at: new Date().toISOString(),
  });
}
