import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Vite
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si usas Next.js, usa process.env.NEXT_PUBLIC_SUPABASE_URL

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
