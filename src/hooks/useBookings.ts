import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Booking {
  id: string;
  machine_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  amount: number;
  created_at: string;
}

export function useBookings(machineId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (machineId) {
      fetchMachineBookings(machineId);
    } else {
      fetchUserBookings();
    }
  }, [machineId]);

  const fetchMachineBookings = async (machineId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('machine_id', machineId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setUserBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'user_id' | 'status' | 'payment_status'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          user_id: userData.user.id,
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (machineId) {
        await fetchMachineBookings(machineId);
      } else {
        await fetchUserBookings();
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      
      if (machineId) {
        await fetchMachineBookings(machineId);
      } else {
        await fetchUserBookings();
      }
    } catch (err) {
      throw err;
    }
  };

  const updatePaymentStatus = async (bookingId: string, paymentStatus: Booking['payment_status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      if (machineId) {
        await fetchMachineBookings(machineId);
      } else {
        await fetchUserBookings();
      }
    } catch (err) {
      throw err;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          payment_status: 'refunded'
        })
        .eq('id', bookingId);

      if (error) throw error;
      
      if (machineId) {
        await fetchMachineBookings(machineId);
      } else {
        await fetchUserBookings();
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    bookings,
    userBookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    updatePaymentStatus,
    cancelBooking
  };
}
