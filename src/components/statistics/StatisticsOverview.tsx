import React, { useEffect, useState } from 'react';
import { StatCard } from './StatCard';
import { Phone, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface StatData {
  total_count: number;
  percentage_change?: number;
  absolute_change?: number;
  details?: any[];
  average_time?: number;
  resolution_rate?: number;
}

export const StatisticsOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    calls?: StatData;
    info?: StatData;
    issues?: StatData;
    critical?: StatData;
  }>({});

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Récupérer les statistiques générales
      const [calls, info, issues, critical] = await Promise.all([
        supabase.rpc('get_total_calls'),
        supabase.rpc('get_info_requests'),
        supabase.rpc('get_reported_issues'),
        supabase.rpc('get_critical_machines')
      ]);

      // Récupérer les détails pour chaque catégorie
      const [callsDetails, infoDetails, issuesDetails, criticalDetails] = await Promise.all([
        supabase
          .from('support_calls')
          .select(`
            *,
            laundries (name, address),
            machines (number, type)
          `)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false }),
        
        supabase
          .from('support_calls')
          .select(`
            *,
            laundries (name, address),
            machines (number, type)
          `)
          .eq('category', 'information_request')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false }),
        
        supabase
          .from('support_calls')
          .select(`
            *,
            laundries (name, address),
            machines (number, type)
          `)
          .eq('category', 'technical_issue')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false }),
        
        supabase
          .from('support_calls')
          .select(`
            *,
            laundries (name, address),
            machines (number, type)
          `)
          .eq('category', 'critical_incident')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
      ]);

      // Calculer les statistiques détaillées
      const calculateStats = (data: any[]) => {
        const totalTime = data.reduce((acc, call) => acc + (call.duration || 0), 0);
        const avgTime = data.length > 0 ? totalTime / data.length : 0;
        const resolvedCount = data.filter(call => call.status === 'resolved').length;
        const resolutionRate = data.length > 0 ? (resolvedCount / data.length) * 100 : 0;

        return {
          average_time: avgTime,
          resolution_rate: resolutionRate,
          details: data
        };
      };

      setStats({
        calls: {
          ...calls.data?.[0],
          ...calculateStats(callsDetails.data || [])
        },
        info: {
          ...info.data?.[0],
          ...calculateStats(infoDetails.data || [])
        },
        issues: {
          ...issues.data?.[0],
          ...calculateStats(issuesDetails.data || [])
        },
        critical: {
          ...critical.data?.[0],
          ...calculateStats(criticalDetails.data || [])
        }
      });
    };

    fetchStats();
    
    // Mettre à jour toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    // Souscrire aux changements en temps réel
    const subscription = supabase
      .channel('support_calls_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_calls' 
        }, 
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const handleCardClick = (category: string) => {
    switch (category) {
      case 'total':
        navigate('/dashboard/calls');
        break;
      case 'info':
        navigate('/dashboard/info-requests');
        break;
      case 'problem':
        navigate('/dashboard/problems');
        break;
      case 'critical':
        navigate('/dashboard/critical');
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard
        icon={<Phone className="w-8 h-8" />}
        title="Total des appels"
        value={stats.calls?.total_count ?? 0}
        change={`${stats.calls?.percentage_change ?? 0 > 0 ? '+' : ''}${stats.calls?.percentage_change ?? 0}%`}
        color="bg-blue-500"
        category="total"
        details={{
          average_time: stats.calls?.average_time,
          resolution_rate: stats.calls?.resolution_rate,
          calls: stats.calls?.details
        }}
        onClick={() => handleCardClick('total')}
      />
      
      <StatCard
        icon={<CheckCircle className="w-8 h-8" />}
        title="Demandes info + Cas traités"
        value={stats.info?.total_count ?? 0}
        change={`${stats.info?.percentage_change ?? 0 > 0 ? '+' : ''}${stats.info?.percentage_change ?? 0}%`}
        color="bg-green-500"
        category="info"
        details={{
          average_time: stats.info?.average_time,
          resolution_rate: stats.info?.resolution_rate,
          calls: stats.info?.details
        }}
        onClick={() => handleCardClick('info')}
      />
      
      <StatCard
        icon={<AlertTriangle className="w-8 h-8" />}
        title="Problèmes signalés"
        value={stats.issues?.total_count ?? 0}
        change={`${stats.issues?.percentage_change ?? 0 > 0 ? '+' : ''}${stats.issues?.percentage_change ?? 0}%`}
        color="bg-orange-500"
        category="problem"
        details={{
          average_time: stats.issues?.average_time,
          resolution_rate: stats.issues?.resolution_rate,
          calls: stats.issues?.details
        }}
        onClick={() => handleCardClick('problem')}
      />
      
      <StatCard
        icon={<AlertCircle className="w-8 h-8" />}
        title="Incident Prioritaire"
        value={stats.critical?.total_count ?? 0}
        change={`${stats.critical?.absolute_change ?? 0 > 0 ? '+' : ''}${stats.critical?.absolute_change ?? 0}`}
        color="bg-red-500"
        category="critical"
        details={{
          average_time: stats.critical?.average_time,
          resolution_rate: stats.critical?.resolution_rate,
          calls: stats.critical?.details
        }}
        onClick={() => handleCardClick('critical')}
      />
    </div>
  );
};
