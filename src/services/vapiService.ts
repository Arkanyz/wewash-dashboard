import { supabase } from '../lib/supabase';

const VAPI_PUBLIC_KEY = '0f5c8b0d-b101-4e81-b9aa-2b4b2e0f7026';
const VAPI_PRIVATE_KEY = '56d5baaa-aeea-49ef-b28b-360edd3208ce';

interface VAPIResponse {
  status: 'ok' | 'warning' | 'error';
  message?: string;
  timestamp: string;
  machine_id: string;
}

export class VAPIService {
  private static instance: VAPIService;
  private pollingInterval: number = 5 * 60 * 1000; // 5 minutes
  private intervalId?: NodeJS.Timeout;

  private constructor() {
    // Singleton
  }

  public static getInstance(): VAPIService {
    if (!VAPIService.instance) {
      VAPIService.instance = new VAPIService();
    }
    return VAPIService.instance;
  }

  // Démarrer le monitoring
  public startMonitoring() {
    this.checkMachinesStatus();
    this.intervalId = setInterval(() => this.checkMachinesStatus(), this.pollingInterval);
  }

  // Arrêter le monitoring
  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Vérifier le statut d'une machine spécifique
  public async checkMachineStatus(machineId: string): Promise<void> {
    try {
      const response = await fetch(`https://api.vapi.com/v1/machines/${machineId}/status`, {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'X-API-Key': VAPI_PUBLIC_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch machine status');
      }

      const data: VAPIResponse = await response.json();
      
      // Mettre à jour le statut dans Supabase
      await this.updateMachineStatus(machineId, {
        status: data.status,
        last_vapi_check: new Date().toISOString(),
        last_status_update: new Date().toISOString()
      });

      // Si erreur, créer une notification
      if (data.status === 'error') {
        await this.createNotification(machineId, data.message || 'Problème détecté sur la machine');
      }

    } catch (error) {
      console.error('Error checking machine status:', error);
    }
  }

  // Vérifier toutes les machines
  private async checkMachinesStatus(): Promise<void> {
    try {
      // Récupérer toutes les machines
      const { data: machines, error } = await supabase
        .from('machines')
        .select('id');

      if (error) throw error;

      // Vérifier chaque machine
      for (const machine of machines) {
        await this.checkMachineStatus(machine.id);
      }

    } catch (error) {
      console.error('Error checking machines status:', error);
    }
  }

  // Mettre à jour le statut d'une machine
  private async updateMachineStatus(machineId: string, updateData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('machines')
        .update(updateData)
        .eq('id', machineId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating machine status:', error);
    }
  }

  // Créer une notification
  private async createNotification(machineId: string, message: string): Promise<void> {
    try {
      // Récupérer les informations de la machine
      const { data: machine, error: machineError } = await supabase
        .from('machines')
        .select('*, laundries(name)')
        .eq('id', machineId)
        .single();

      if (machineError) throw machineError;

      // Créer la notification pour les admins et techniciens
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          title: `Problème machine - ${machine.laundries.name}`,
          message: message,
          type: 'machine_error',
          machine_id: machineId,
          priority: 'high'
        });

      if (notifError) throw notifError;

    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}

// Export singleton instance
export const vapiService = VAPIService.getInstance();
