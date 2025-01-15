export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      laundries: {
        Row: {
          id: string
          created_at: string
          name: string
          address: string
          owner_id: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          address: string
          owner_id: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          address?: string
          owner_id?: string
          status?: string
        }
      }
      machines: {
        Row: {
          id: string
          created_at: string
          name: string
          laundry_id: string
          status: 'ok' | 'maintenance' | 'out_of_order'
          last_operation: string | null
          last_update: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          laundry_id: string
          status?: 'ok' | 'maintenance' | 'out_of_order'
          last_operation?: string | null
          last_update?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          laundry_id?: string
          status?: 'ok' | 'maintenance' | 'out_of_order'
          last_operation?: string | null
          last_update?: string
        }
      }
      maintenance_reports: {
        Row: {
          id: string
          machine_id: string
          description: string
          severity: 'low' | 'medium' | 'high'
          created_at: string
          resolved_at: string | null
          created_by: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          machine_id: string
          description: string
          severity: 'low' | 'medium' | 'high'
          created_at?: string
          resolved_at?: string | null
          created_by?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          machine_id?: string
          description?: string
          severity?: 'low' | 'medium' | 'high'
          created_at?: string
          resolved_at?: string | null
          created_by?: string | null
          resolved_by?: string | null
        }
      }
      support_calls: {
        Row: {
          id: string
          machine_id: string
          type: 'information' | 'problem' | 'maintenance' | 'payment' | 'other'
          description: string | null
          status: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
          created_at: string
          resolved_at: string | null
          created_by: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          machine_id: string
          type: 'information' | 'problem' | 'maintenance' | 'payment' | 'other'
          description?: string | null
          status?: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
          created_at?: string
          resolved_at?: string | null
          created_by?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          machine_id?: string
          type?: 'information' | 'problem' | 'maintenance' | 'payment' | 'other'
          description?: string | null
          status?: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
          created_at?: string
          resolved_at?: string | null
          created_by?: string | null
          resolved_by?: string | null
        }
      }
      technicians: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string
          email: string
          speciality: string
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone: string
          email: string
          speciality: string
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string
          email?: string
          speciality?: string
          owner_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
