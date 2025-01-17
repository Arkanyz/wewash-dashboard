// This file is temporarily disabled until proper Supabase credentials are configured
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes. Veuillez créer un fichier .env.local avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

// Créer une seule instance de Supabase pour toute l'application
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'wewash-supabase-auth'
  }
});
