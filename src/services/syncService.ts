import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../stores/useAppStore';

class SyncService {
  private static instance: SyncService;
  private subscriptions: { unsubscribe: () => void }[] = [];

  private constructor() {
    // Singleton
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public async initialize(userId: string) {
    // Charger les données initiales
    await this.loadInitialData(userId);
    
    // Configurer les souscriptions en temps réel
    this.setupRealtimeSubscriptions(userId);
  }

  private async loadInitialData(userId: string) {
    const store = useAppStore.getState();
    
    try {
      store.setLoading('laundries', true);
      const { data: laundries } = await supabase
        .from('laundries')
        .select('*')
        .order('created_at', { ascending: false });
      if (laundries) store.setLaundries(laundries);

      store.setLoading('machines', true);
      const { data: machines } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false });
      if (machines) store.setMachines(machines);

      store.setLoading('interventions', true);
      const { data: interventions } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });
      if (interventions) store.setInterventions(interventions);

      store.setLoading('tasks', true);
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (tasks) store.setTasks(tasks);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      store.setLoading('laundries', false);
      store.setLoading('machines', false);
      store.setLoading('interventions', false);
      store.setLoading('tasks', false);
    }
  }

  private setupRealtimeSubscriptions(userId: string) {
    const store = useAppStore.getState();

    // Laundries subscription
    const laundriesSub = supabase
      .channel('laundries_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laundries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            store.addLaundry(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            store.updateLaundry(payload.new.id, payload.new);
          } else if (payload.eventType === 'DELETE') {
            store.removeLaundry(payload.old.id);
          }
        }
      )
      .subscribe();

    // Machines subscription
    const machinesSub = supabase
      .channel('machines_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'machines' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            store.addMachine(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            store.updateMachine(payload.new.id, payload.new);
          } else if (payload.eventType === 'DELETE') {
            store.removeMachine(payload.old.id);
          }
        }
      )
      .subscribe();

    // Interventions subscription
    const interventionsSub = supabase
      .channel('interventions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interventions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            store.addIntervention(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            store.updateIntervention(payload.new.id, payload.new);
          } else if (payload.eventType === 'DELETE') {
            store.removeIntervention(payload.old.id);
          }
        }
      )
      .subscribe();

    // Tasks subscription
    const tasksSub = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            store.addTask(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            store.updateTask(payload.new.id, payload.new);
          } else if (payload.eventType === 'DELETE') {
            store.removeTask(payload.old.id);
          }
        }
      )
      .subscribe();

    // Stocker les souscriptions pour le nettoyage
    this.subscriptions.push(
      laundriesSub,
      machinesSub,
      interventionsSub,
      tasksSub
    );
  }

  public cleanup() {
    // Nettoyer toutes les souscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  // Méthodes utilitaires pour la synchronisation manuelle
  public async syncLaundries() {
    await this.loadInitialData(useAppStore.getState().currentUser?.id || '');
  }

  public async syncMachines() {
    const store = useAppStore.getState();
    const { data } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) store.setMachines(data);
  }

  public async syncInterventions() {
    const store = useAppStore.getState();
    const { data } = await supabase
      .from('interventions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) store.setInterventions(data);
  }

  public async syncTasks() {
    const store = useAppStore.getState();
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) store.setTasks(data);
  }
}

export const syncService = SyncService.getInstance();
