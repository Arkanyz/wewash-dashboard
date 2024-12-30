import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Laundry, Machine, Intervention, Task, Notification } from '../lib/supabase/client';

interface AppState {
  // États existants
  currentUser: Profile | null;
  laundries: Laundry[];
  machines: Machine[];
  interventions: Intervention[];
  tasks: Task[];
  notifications: Notification[];
  
  // États UI
  sidebarOpen: boolean;
  currentTheme: 'light' | 'dark';
  loading: {
    laundries: boolean;
    machines: boolean;
    interventions: boolean;
    tasks: boolean;
  };
  
  // Actions
  setCurrentUser: (user: Profile | null) => void;
  setLaundries: (laundries: Laundry[]) => void;
  addLaundry: (laundry: Laundry) => void;
  updateLaundry: (id: string, updates: Partial<Laundry>) => void;
  removeLaundry: (id: string) => void;
  
  setMachines: (machines: Machine[]) => void;
  addMachine: (machine: Machine) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  removeMachine: (id: string) => void;
  
  setInterventions: (interventions: Intervention[]) => void;
  addIntervention: (intervention: Intervention) => void;
  updateIntervention: (id: string, updates: Partial<Intervention>) => void;
  removeIntervention: (id: string) => void;
  
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // États initiaux
      currentUser: null,
      laundries: [],
      machines: [],
      interventions: [],
      tasks: [],
      notifications: [],
      sidebarOpen: true,
      currentTheme: 'dark',
      loading: {
        laundries: false,
        machines: false,
        interventions: false,
        tasks: false,
      },

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      
      setLaundries: (laundries) => set({ laundries }),
      addLaundry: (laundry) => set((state) => ({ 
        laundries: [...state.laundries, laundry] 
      })),
      updateLaundry: (id, updates) => set((state) => ({
        laundries: state.laundries.map((l) => 
          l.id === id ? { ...l, ...updates } : l
        ),
      })),
      removeLaundry: (id) => set((state) => ({
        laundries: state.laundries.filter((l) => l.id !== id),
      })),

      setMachines: (machines) => set({ machines }),
      addMachine: (machine) => set((state) => ({
        machines: [...state.machines, machine],
      })),
      updateMachine: (id, updates) => set((state) => ({
        machines: state.machines.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      })),
      removeMachine: (id) => set((state) => ({
        machines: state.machines.filter((m) => m.id !== id),
      })),

      setInterventions: (interventions) => set({ interventions }),
      addIntervention: (intervention) => set((state) => ({
        interventions: [...state.interventions, intervention],
      })),
      updateIntervention: (id, updates) => set((state) => ({
        interventions: state.interventions.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      })),
      removeIntervention: (id) => set((state) => ({
        interventions: state.interventions.filter((i) => i.id !== id),
      })),

      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),

      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
      clearNotifications: () => set({ notifications: [] }),

      // UI Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ currentTheme: theme }),
      setLoading: (key, value) => set((state) => ({
        loading: { ...state.loading, [key]: value },
      })),
    }),
    {
      name: 'wewash-store',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
