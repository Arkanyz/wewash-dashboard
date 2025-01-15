import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  user_id: string;
}

interface SupportMessage {
  ticket_id: string;
  message: string;
  created_at: string;
  user_id: string;
}

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (subject: string, message: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            subject,
            message,
            status: 'open',
            user_id: userData.user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      await fetchTickets();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const addMessage = async (ticketId: string, message: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('support_messages')
        .insert([
          {
            ticket_id: ticketId,
            message,
            user_id: userData.user.id
          }
        ]);

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;
      await fetchTickets();
    } catch (err) {
      throw err;
    }
  };

  return {
    tickets,
    loading,
    error,
    createTicket,
    addMessage,
    updateTicketStatus
  };
}
