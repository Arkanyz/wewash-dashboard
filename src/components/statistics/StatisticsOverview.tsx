import React, { useEffect, useState } from 'react';
import { StatCard } from './StatCard';
import { Phone, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface StatData {
  total_count: number;
  percentage_change?: number;
  absolute_change?: number;
}

export const StatisticsOverview: React.FC = () => {
  const [stats, setStats] = useState<{
    calls?: StatData;
    info?: StatData;
    issues?: StatData;
    critical?: StatData;
  }>({});

  useEffect(() => {
    const fetchStats = async () => {
      const [calls, info, issues, critical] = await Promise.all([
        supabase.rpc('get_total_calls'),
        supabase.rpc('get_info_requests'),
        supabase.rpc('get_reported_issues'),
        supabase.rpc('get_critical_machines')
      ]);

      setStats({
        calls: calls.data?.[0],
        info: info.data?.[0],
        issues: issues.data?.[0],
        critical: critical.data?.[0]
      });
    };

    fetchStats();
    
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard
        icon={<Phone className="w-8 h-8" />}
        title="Total des appels"
        value={stats.calls?.total_count ?? 0}
        change={`${stats.calls?.percentage_change ?? 0 > 0 ? '+' : ''}${stats.calls?.percentage_change ?? 0}%`}
        color="bg-blue-500"
        query="support_calls"
      />
      
      <StatCard
        icon={<CheckCircle className="w-8 h-8" />}
        title="Demandes info + Cas traités"
        value={stats.info?.total_count ?? 0}
        change={`${stats.info?.percentage_change ?? 0 > 0 ? '+' : ''}${stats.info?.percentage_change ?? 0}%`}
        color="bg-green-500"
        query="support_calls?type=eq.information"
      />
      
      <StatCard
        icon={<AlertTriangle className="w-8 h-8" />}
        title="Problèmes signalés"
        value={stats.issues?.total_count ?? 0}
        change={`${stats.issues?.percentage_change ?? 0 > 0 ? '+' : ''}${stats.issues?.percentage_change ?? 0}%`}
        color="bg-orange-500"
        query="support_calls?type=eq.problem"
      />
      
      <StatCard
        icon={<AlertCircle className="w-8 h-8" />}
        title="Incident Prioritaire"
        value={stats.critical?.total_count ?? 0}
        change={`${stats.critical?.absolute_change ?? 0 > 0 ? '+' : ''}${stats.critical?.absolute_change ?? 0}`}
        color="bg-red-500"
        query="maintenance_reports?severity=eq.high&resolved_at=is.null"
      />
    </div>
  );
};
