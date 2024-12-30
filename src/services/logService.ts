import { supabase } from '../lib/supabase/client';

type LogLevel = 'info' | 'warning' | 'error' | 'debug';
type LogCategory = 'auth' | 'data' | 'performance' | 'security' | 'user_action';

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  user_id?: string;
  timestamp: string;
}

class LogService {
  private static instance: LogService;
  private logQueue: LogEntry[] = [];
  private isProcessing: boolean = false;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 secondes

  private constructor() {
    this.startPeriodicFlush();
  }

  public static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  private startPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private async flush() {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.logQueue.splice(0, this.BATCH_SIZE);

    try {
      const { error } = await supabase
        .from('logs')
        .insert(batch);

      if (error) {
        console.error('Error flushing logs:', error);
        // Remettre les logs dans la queue en cas d'erreur
        this.logQueue.unshift(...batch);
      }
    } catch (error) {
      console.error('Error flushing logs:', error);
      this.logQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  public async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    userId?: string
  ) {
    const logEntry: LogEntry = {
      level,
      category,
      message,
      details,
      user_id: userId,
      timestamp: new Date().toISOString()
    };

    // Ajouter à la queue
    this.logQueue.push(logEntry);

    // Si la queue atteint la taille du batch, flush immédiatement
    if (this.logQueue.length >= this.BATCH_SIZE) {
      this.flush();
    }

    // Log console en développement
    if (import.meta.env.DEV) {
      const consoleMethod = level === 'error' ? 'error' : 
                          level === 'warning' ? 'warn' : 
                          level === 'debug' ? 'debug' : 'log';
      console[consoleMethod](`[${category.toUpperCase()}] ${message}`, details || '');
    }
  }

  // Méthodes pratiques
  public info(category: LogCategory, message: string, details?: any, userId?: string) {
    return this.log('info', category, message, details, userId);
  }

  public warning(category: LogCategory, message: string, details?: any, userId?: string) {
    return this.log('warning', category, message, details, userId);
  }

  public error(category: LogCategory, message: string, details?: any, userId?: string) {
    return this.log('error', category, message, details, userId);
  }

  public debug(category: LogCategory, message: string, details?: any, userId?: string) {
    if (import.meta.env.DEV) {
      return this.log('debug', category, message, details, userId);
    }
  }

  // Méthodes spécifiques
  public logUserAction(action: string, details?: any, userId?: string) {
    return this.info('user_action', action, details, userId);
  }

  public logAuthEvent(message: string, details?: any, userId?: string) {
    return this.info('auth', message, details, userId);
  }

  public logSecurityEvent(message: string, details?: any, userId?: string) {
    return this.warning('security', message, details, userId);
  }

  public logPerformanceMetric(message: string, details?: any) {
    return this.debug('performance', message, details);
  }
}

export const logService = LogService.getInstance();
