import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
}

interface Intervention {
  id: string;
  task_id: string;
  technician_id: string;
  start_time: string;
  end_time?: string;
  notes: string;
  status: 'planned' | 'in_progress' | 'completed';
}

interface Technician {
  id: string;
  user_id: string;
  specialization: string;
  availability: 'available' | 'busy' | 'off';
}

export function useMaintenanceSystem() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchTechnicians();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('specialization');

      if (error) throw error;
      setTechnicians(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      await fetchTasks();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (err) {
      throw err;
    }
  };

  const assignTask = async (taskId: string, technicianId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: technicianId })
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (err) {
      throw err;
    }
  };

  const createIntervention = async (interventionData: Omit<Intervention, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .insert([interventionData])
        .select()
        .single();

      if (error) throw error;
      
      // Mettre à jour le statut du technicien
      await supabase
        .from('technicians')
        .update({ availability: 'busy' })
        .eq('id', interventionData.technician_id);

      return data;
    } catch (err) {
      throw err;
    }
  };

  const completeIntervention = async (interventionId: string, notes: string) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('interventions')
        .update({
          status: 'completed',
          end_time: now,
          notes
        })
        .eq('id', interventionId)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le statut du technicien
      if (data) {
        await supabase
          .from('technicians')
          .update({ availability: 'available' })
          .eq('id', data.technician_id);
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateTechnicianAvailability = async (technicianId: string, availability: Technician['availability']) => {
    try {
      const { error } = await supabase
        .from('technicians')
        .update({ availability })
        .eq('id', technicianId);

      if (error) throw error;
      await fetchTechnicians();
    } catch (err) {
      throw err;
    }
  };

  return {
    tasks,
    interventions,
    technicians,
    loading,
    error,
    createTask,
    updateTaskStatus,
    assignTask,
    createIntervention,
    completeIntervention,
    updateTechnicianAvailability
  };
}
