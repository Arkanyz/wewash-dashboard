import { logService } from './logService';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  key: string;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>>;
  private options: Required<CacheOptions>;

  private constructor() {
    this.cache = new Map();
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes par défaut
      maxSize: 1000 // 1000 items maximum par défaut
    };

    // Nettoyer le cache périodiquement
    setInterval(() => this.cleanup(), 60 * 1000); // Toutes les minutes
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public configure(options: CacheOptions) {
    this.options = { ...this.options, ...options };
  }

  public set<T>(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl || this.options.ttl;

    // Si le cache est plein, supprimer l'élément le plus ancien
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const cacheItem: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      key
    };

    this.cache.set(key, cacheItem);

    logService.debug('performance', `Cache set: ${key}`, {
      cacheSize: this.cache.size,
      ttl
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      logService.debug('performance', `Cache miss: ${key}`);
      return null;
    }

    // Vérifier si l'élément est expiré
    if (this.isExpired(item)) {
      this.cache.delete(key);
      logService.debug('performance', `Cache expired: ${key}`);
      return null;
    }

    logService.debug('performance', `Cache hit: ${key}`);
    return item.value;
  }

  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cachedValue = this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    try {
      const value = await fetchFn();
      this.set(key, value, options);
      return value;
    } catch (error) {
      logService.error('performance', `Error fetching data for cache: ${key}`, error);
      throw error;
    }
  }

  public delete(key: string): void {
    this.cache.delete(key);
    logService.debug('performance', `Cache delete: ${key}`);
  }

  public clear(): void {
    this.cache.clear();
    logService.debug('performance', 'Cache cleared');
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > this.options.ttl;
  }

  private getOldestKey(): string | null {
    let oldestTimestamp = Infinity;
    let oldestKey: string | null = null;

    this.cache.forEach((item) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = item.key;
      }
    });

    return oldestKey;
  }

  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > this.options.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      logService.debug('performance', `Cache cleanup: removed ${deletedCount} items`);
    }
  }

  // Méthodes utilitaires pour les cas d'utilisation courants
  public async fetchLaundry(id: string) {
    return this.getOrSet(`laundry:${id}`, async () => {
      // Implémentation de la récupération des données
      return null;
    });
  }

  public async fetchMachine(id: string) {
    return this.getOrSet(`machine:${id}`, async () => {
      // Implémentation de la récupération des données
      return null;
    });
  }

  public async fetchIntervention(id: string) {
    return this.getOrSet(`intervention:${id}`, async () => {
      // Implémentation de la récupération des données
      return null;
    });
  }

  public invalidateLaundryCache(id: string) {
    this.delete(`laundry:${id}`);
  }

  public invalidateMachineCache(id: string) {
    this.delete(`machine:${id}`);
  }

  public invalidateInterventionCache(id: string) {
    this.delete(`intervention:${id}`);
  }
}

export const cacheService = CacheService.getInstance();
