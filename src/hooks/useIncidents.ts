import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface Incident {
  id: string;
  machine_id: string;
  laundry_id: string;
  description: string;
  status: 'reported' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  reported_by: string;
  created_at: string;
  resolved_at?: string;
}

interface MaintenanceLog {
  id: string;
  incident_id: string;
  description: string;
  technician_id: string;
  created_at: string;
}

export function useIncidents(laundryId?: string) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, [laundryId]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (laundryId) {
        query.eq('laundry_id', laundryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setIncidents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incidentData: Omit<Incident, 'id' | 'created_at'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('incidents')
        .insert([{
          ...incidentData,
          reported_by: userData.user.id,
          status: 'reported'
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchIncidents();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: Incident['status']) => {
    try {
      const updates: Partial<Incident> = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', incidentId);

      if (error) throw error;
      await fetchIncidents();
    } catch (err) {
      throw err;
    }
  };

  const addMaintenanceLog = async (incidentId: string, description: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('maintenance_logs')
        .insert([{
          incident_id: incidentId,
          description,
          technician_id: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const fetchMaintenanceLogs = async (incidentId: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMaintenanceLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return {
    incidents,
    maintenanceLogs,
    loading,
    error,
    createIncident,
    updateIncidentStatus,
    addMaintenanceLog,
    fetchMaintenanceLogs
  };
}
