import { useState, useEffect } from 'react';
import { logService } from '../services/logService';
import { cacheService } from '../services/cacheService';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface MetricOptions {
  threshold?: number;
  logLevel?: 'info' | 'warning' | 'error';
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  // Mesurer le temps d'exécution d'une fonction
  const measureExecutionTime = async <T>(
    name: string,
    fn: () => Promise<T>,
    options: MetricOptions = {}
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      const metric: PerformanceMetric = {
        name,
        value: duration,
        timestamp: Date.now(),
        metadata: { success: true }
      };

      setMetrics(prev => [...prev, metric]);

      // Vérifier le seuil de performance
      if (options.threshold && duration > options.threshold) {
        logService[options.logLevel || 'warning']('performance', 
          `Performance threshold exceeded for ${name}`, 
          { duration, threshold: options.threshold }
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      const metric: PerformanceMetric = {
        name,
        value: duration,
        timestamp: Date.now(),
        metadata: { success: false, error }
      };

      setMetrics(prev => [...prev, metric]);
      throw error;
    }
  };

  // Mesurer les métriques de rendu
  const measureRenderTime = (componentName: string) => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      const metric: PerformanceMetric = {
        name: `${componentName}_render`,
        value: duration,
        timestamp: Date.now()
      };

      setMetrics(prev => [...prev, metric]);
    };
  };

  // Mesurer les performances réseau
  const measureNetworkCall = async <T>(
    name: string,
    url: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    const metric: Partial<PerformanceMetric> = {
      name: `network_${name}`,
      metadata: { url }
    };

    try {
      // Vérifier le cache
      const cachedData = cacheService.get<T>(url);
      if (cachedData) {
        metric.value = performance.now() - startTime;
        metric.metadata = { ...metric.metadata, cached: true };
        setMetrics(prev => [...prev, metric as PerformanceMetric]);
        return cachedData;
      }

      const result = await fetchFn();
      metric.value = performance.now() - startTime;
      metric.metadata = { ...metric.metadata, cached: false };
      
      // Mettre en cache le résultat
      cacheService.set(url, result);
      
      setMetrics(prev => [...prev, metric as PerformanceMetric]);
      return result;
    } catch (error) {
      metric.value = performance.now() - startTime;
      metric.metadata = { ...metric.metadata, error };
      setMetrics(prev => [...prev, metric as PerformanceMetric]);
      throw error;
    }
  };

  // Analyser les métriques
  const analyzeMetrics = () => {
    const analysis = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }

      const stats = acc[metric.name];
      stats.count++;
      stats.total += metric.value;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.avg = stats.total / stats.count;

      return acc;
    }, {} as Record<string, { count: number; total: number; min: number; max: number; avg: number }>);

    return analysis;
  };

  // Nettoyer les anciennes métriques
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      setMetrics(prev => prev.filter(metric => metric.timestamp > oneHourAgo));
    }, 15 * 60 * 1000); // Nettoyer toutes les 15 minutes

    return () => clearInterval(cleanup);
  }, []);

  return {
    metrics,
    measureExecutionTime,
    measureRenderTime,
    measureNetworkCall,
    analyzeMetrics
  };
}
