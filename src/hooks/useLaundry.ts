import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Machine {
  id: string;
  number: string; // Numéro affiché sur la machine
  type: 'washer' | 'dryer';
  status: 'available' | 'out_of_order';
}

interface Laundry {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string; // Numéro de téléphone pour les appels clients
  machines: Machine[];
}

export function useLaundry(laundryId?: string) {
  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [currentLaundry, setCurrentLaundry] = useState<Laundry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (laundryId) {
      fetchLaundry(laundryId);
    } else {
      fetchLaundries();
    }
  }, [laundryId]);

  const fetchLaundries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundries')
        .select(`
          *,
          machines (*)
        `)
        .order('name');

      if (error) throw error;
      setLaundries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchLaundry = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundries')
        .select(`
          *,
          machines (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setCurrentLaundry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createLaundry = async (laundryData: Omit<Laundry, 'id' | 'machines'>) => {
    try {
      // Validation des données essentielles
      if (!laundryData.name || !laundryData.address || !laundryData.city || 
          !laundryData.postal_code || !laundryData.phone) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }

      // Validation du format téléphone (format français)
      const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
      if (!phoneRegex.test(laundryData.phone)) {
        throw new Error('Format de téléphone invalide');
      }

      const { data, error } = await supabase
        .from('laundries')
        .insert([laundryData])
        .select()
        .single();

      if (error) throw error;
      setLaundries(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création de la laverie');
      throw err;
    }
  };

  const updateLaundry = async (id: string, updates: Partial<Laundry>) => {
    try {
      const { error } = await supabase
        .from('laundries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      if (laundryId) {
        await fetchLaundry(id);
      } else {
        await fetchLaundries();
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteLaundry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('laundries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLaundries();
    } catch (err) {
      throw err;
    }
  };

  const addMachine = async (laundryId: string, machineData: Omit<Machine, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .insert([{ ...machineData, laundry_id: laundryId }])
        .select()
        .single();

      if (error) throw error;
      if (currentLaundry) {
        await fetchLaundry(laundryId);
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateMachine = async (machineId: string, updates: Partial<Machine>) => {
    try {
      const { error } = await supabase
        .from('machines')
        .update(updates)
        .eq('id', machineId);

      if (error) throw error;
      if (currentLaundry) {
        await fetchLaundry(currentLaundry.id);
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    laundries,
    currentLaundry,
    loading,
    error,
    createLaundry,
    updateLaundry,
    deleteLaundry,
    addMachine,
    updateMachine
  };
}
