import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface MetricData {
  current: number;
  previous: number;
  percentChange: number;
  trend: 'up' | 'down';
}

interface Statistics {
  revenue: MetricData;
  users: MetricData;
  machines: MetricData;
  utilization: MetricData;
}

export function useStatistics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        // Récupérer les données de Supabase
        const { data, error } = await supabase
          .rpc('get_statistics', { period_param: period });

        if (error) throw error;

        // Transformer les données
        const stats: Statistics = {
          revenue: {
            current: data.revenue_current || 0,
            previous: data.revenue_previous || 0,
            percentChange: calculatePercentChange(data.revenue_current, data.revenue_previous),
            trend: data.revenue_current >= data.revenue_previous ? 'up' : 'down'
          },
          users: {
            current: data.users_current || 0,
            previous: data.users_previous || 0,
            percentChange: calculatePercentChange(data.users_current, data.users_previous),
            trend: data.users_current >= data.users_previous ? 'up' : 'down'
          },
          machines: {
            current: data.machines_current || 0,
            previous: data.machines_previous || 0,
            percentChange: calculatePercentChange(data.machines_current, data.machines_previous),
            trend: data.machines_current >= data.machines_previous ? 'up' : 'down'
          },
          utilization: {
            current: data.utilization_current || 0,
            previous: data.utilization_previous || 0,
            percentChange: calculatePercentChange(data.utilization_current, data.utilization_previous),
            trend: data.utilization_current >= data.utilization_previous ? 'up' : 'down'
          }
        };

        setStatistics(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [period]);

  const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return 100;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  return { statistics, loading, error };
}
