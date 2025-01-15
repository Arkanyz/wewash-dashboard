import { useState, useEffect } from 'react';
import { vapiService } from '../services/vapiService';
import { supabase } from '../lib/supabase';

export const useVAPI = (machineId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Démarrer le monitoring global si aucun machineId n'est spécifié
    if (!machineId) {
      vapiService.startMonitoring();
      return () => vapiService.stopMonitoring();
    }
  }, [machineId]);

  // Vérifier une machine spécifique
  const checkMachine = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await vapiService.checkMachineStatus(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Écouter les changements de statut en temps réel
  useEffect(() => {
    if (!machineId) return;

    const subscription = supabase
      .from(`machines:id=eq.${machineId}`)
      .on('UPDATE', payload => {
        console.log('Machine status updated:', payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [machineId]);

  return {
    loading,
    error,
    checkMachine
  };
};
