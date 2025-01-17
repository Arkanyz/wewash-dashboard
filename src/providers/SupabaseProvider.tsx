'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface SupabaseContextType {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const defaultContextValue: SupabaseContextType = {
  supabase,
  user: null,
  session: null,
  loading: true,
};

const SupabaseContext = createContext<SupabaseContextType>(defaultContextValue);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [contextValue, setContextValue] = useState<SupabaseContextType>(defaultContextValue);

  useEffect(() => {
    // Récupérer la session initiale
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setContextValue(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setContextValue(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
          }));
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setContextValue(prev => ({
          ...prev,
          loading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {!contextValue.loading && children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
