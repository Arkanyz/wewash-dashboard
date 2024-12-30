import { logService } from './logService';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

interface ErrorMetadata {
  component?: string;
  action?: string;
  params?: Record<string, any>;
  timestamp: number;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorHistory: Map<string, ErrorMetadata[]>;
  private readonly DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT']
  };

  private constructor() {
    this.errorHistory = new Map();
    this.cleanupErrorHistory();
  }

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  public async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const retryOptions = { ...this.DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error;
    let delay = retryOptions.initialDelay;

    for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Vérifier si l'erreur est retryable
        if (!this.isRetryableError(error, retryOptions.retryableErrors)) {
          throw error;
        }

        // Dernière tentative
        if (attempt === retryOptions.maxAttempts) {
          throw error;
        }

        // Logger la tentative
        logService.warning('performance', 
          `Retry attempt ${attempt}/${retryOptions.maxAttempts}`,
          { error, delay }
        );

        // Attendre avant la prochaine tentative
        await this.delay(delay);
        
        // Calculer le prochain délai avec backoff exponentiel
        delay = Math.min(
          delay * retryOptions.backoffFactor,
          retryOptions.maxDelay
        );
      }
    }

    throw lastError!;
  }

  public handleError(error: Error, metadata: Omit<ErrorMetadata, 'timestamp'> = {}) {
    const errorId = error.message;
    const errorMetadata: ErrorMetadata = {
      ...metadata,
      timestamp: Date.now()
    };

    // Ajouter à l'historique
    if (!this.errorHistory.has(errorId)) {
      this.errorHistory.set(errorId, []);
    }
    this.errorHistory.get(errorId)!.push(errorMetadata);

    // Logger l'erreur
    logService.error('error', error.message, {
      ...metadata,
      stack: error.stack
    });

    // Analyser la fréquence des erreurs
    this.analyzeErrorFrequency(errorId);
  }

  public getErrorHistory(errorId?: string): ErrorMetadata[] {
    if (errorId) {
      return this.errorHistory.get(errorId) || [];
    }

    return Array.from(this.errorHistory.values()).flat();
  }

  public clearErrorHistory(): void {
    this.errorHistory.clear();
  }

  private isRetryableError(error: any, retryableErrors: string[]): boolean {
    // Vérifier le code d'erreur
    if (error.code && retryableErrors.includes(error.code)) {
      return true;
    }

    // Vérifier les erreurs réseau
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return true;
    }

    // Vérifier les timeouts
    if (error.name === 'TimeoutError') {
      return true;
    }

    // Vérifier les status HTTP
    if (error.status) {
      // Retry sur les erreurs 5xx et certaines 4xx
      return error.status >= 500 || [429, 408].includes(error.status);
    }

    return false;
  }

  private analyzeErrorFrequency(errorId: string): void {
    const errorInstances = this.errorHistory.get(errorId) || [];
    const recentErrors = errorInstances.filter(
      e => e.timestamp > Date.now() - 5 * 60 * 1000 // 5 minutes
    );

    // Alerter si trop d'erreurs récentes
    if (recentErrors.length >= 5) {
      logService.error('error', 
        `High frequency of error: ${errorId}`,
        { count: recentErrors.length, timeWindow: '5 minutes' }
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanupErrorHistory(): void {
    setInterval(() => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      this.errorHistory.forEach((instances, errorId) => {
        const filteredInstances = instances.filter(
          e => e.timestamp > oneDayAgo
        );
        
        if (filteredInstances.length === 0) {
          this.errorHistory.delete(errorId);
        } else {
          this.errorHistory.set(errorId, filteredInstances);
        }
      });
    }, 60 * 60 * 1000); // Nettoyer toutes les heures
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance();
