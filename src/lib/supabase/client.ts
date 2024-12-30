import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Laundry = Database['public']['Tables']['laundries']['Row'];
export type Machine = Database['public']['Tables']['machines']['Row'];
export type Intervention = Database['public']['Tables']['interventions']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
