import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Laundry = Database['public']['Tables']['laundries']['Row'];
export type Machine = Database['public']['Tables']['machines']['Row'];
export type Intervention = Database['public']['Tables']['interventions']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
