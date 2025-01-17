import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logService } from './logService';
import { supabase } from '../lib/supabaseClient';

interface WeWashDBSchema extends DBSchema {
  pending_operations: {
    key: string;
    value: {
      id: string;
      operation: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: { 'by-timestamp': number };
  };
  cached_data: {
    key: string;
    value: {
      table: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'by-table': string };
  };
}

class OfflineService {
  private static instance: OfflineService;
  private db: IDBPDatabase<WeWashDBSchema> | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInterval: number | null = null;

  private constructor() {
    this.initializeDB();
    this.setupEventListeners();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private async initializeDB() {
    try {
      this.db = await openDB<WeWashDBSchema>('wewash-offline', 1, {
        upgrade(db) {
          // Store pour les opérations en attente
          const pendingStore = db.createObjectStore('pending_operations', {
            keyPath: 'id'
          });
          pendingStore.createIndex('by-timestamp', 'timestamp');

          // Store pour les données en cache
          const cacheStore = db.createObjectStore('cached_data', {
            keyPath: 'id'
          });
          cacheStore.createIndex('by-table', 'table');
        }
      });

      logService.info('system', 'Base de données hors ligne initialisée');
    } catch (error) {
      logService.error('system', 'Erreur lors de l\'initialisation de la base de données', error);
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startSync();
      logService.info('system', 'Connexion rétablie, démarrage de la synchronisation');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopSync();
      logService.warning('system', 'Connexion perdue, passage en mode hors ligne');
    });
  }

  public async queueOperation(
    operation: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const pendingOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    await this.db.add('pending_operations', pendingOperation);
    logService.info('system', 'Opération mise en file d\'attente', pendingOperation);

    if (this.isOnline) {
      this.startSync();
    }
  }

  public async cacheData(table: string, data: any) {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const cacheEntry = {
      id: `${table}-${data.id || Date.now()}`,
      table,
      data,
      timestamp: Date.now()
    };

    await this.db.put('cached_data', cacheEntry);
  }

  public async getCachedData(table: string) {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const index = this.db.transaction('cached_data').store.index('by-table');
    return await index.getAll(table);
  }

  private async startSync() {
    if (this.syncInterval) {
      return;
    }

    this.syncInterval = window.setInterval(async () => {
      await this.syncPendingOperations();
    }, 30000); // Synchroniser toutes les 30 secondes

    // Synchroniser immédiatement
    await this.syncPendingOperations();
  }

  private stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncPendingOperations() {
    if (!this.db || !this.isOnline) {
      return;
    }

    const tx = this.db.transaction('pending_operations', 'readwrite');
    const index = tx.store.index('by-timestamp');
    const operations = await index.getAll();

    for (const operation of operations) {
      try {
        switch (operation.operation) {
          case 'create':
            await supabase.from(operation.table).insert(operation.data);
            break;
          case 'update':
            await supabase
              .from(operation.table)
              .update(operation.data)
              .match({ id: operation.data.id });
            break;
          case 'delete':
            await supabase
              .from(operation.table)
              .delete()
              .match({ id: operation.data.id });
            break;
        }

        // Supprimer l'opération réussie
        await tx.store.delete(operation.id);
        logService.info('system', 'Opération synchronisée avec succès', operation);
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount >= 5) {
          // Après 5 tentatives, marquer comme échoué
          logService.error('system', 'Échec de la synchronisation après 5 tentatives', {
            operation,
            error
          });
          await tx.store.delete(operation.id);
        } else {
          // Mettre à jour le compteur de tentatives
          await tx.store.put(operation);
        }
      }
    }
  }

  public async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 jours par défaut
    if (!this.db) {
      return;
    }

    const tx = this.db.transaction('cached_data', 'readwrite');
    const index = tx.store.index('by-timestamp');
    const oldEntries = await index.getAll(IDBKeyRange.upperBound(Date.now() - maxAge));

    for (const entry of oldEntries) {
      await tx.store.delete(entry.id);
    }

    logService.info('system', `Cache nettoyé : ${oldEntries.length} entrées supprimées`);
  }
}

export const offlineService = OfflineService.getInstance();
