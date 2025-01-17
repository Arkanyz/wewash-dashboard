import React, { useEffect, useState } from 'react';
import { StatCard } from './StatCard';
import { Phone, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface CallStats {
  total: number;
  info: number;
  problem: number;
  critical: number;
}

export function CallsOverview() {
  const supabase = useSupabaseClient();
  const [stats, setStats] = useState<CallStats>({
    total: 0,
    info: 0,
    problem: 0,
    critical: 0
  });

  useEffect(() => {
    // Fonction pour récupérer les statistiques
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Récupérer tous les appels d'aujourd'hui
      const { data: calls } = await supabase
        .from('support_calls')
        .select('*')
        .gte('created_at', today.toISOString());

      if (calls) {
        const newStats = calls.reduce((acc, call) => {
          acc.total++;
          
          switch (call.category) {
            case 'information_request':
              acc.info++;
              break;
            case 'technical_issue':
              acc.problem++;
              break;
            case 'critical_incident':
              acc.critical++;
              break;
          }
          
          return acc;
        }, { total: 0, info: 0, problem: 0, critical: 0 });

        setStats(newStats);
      }
    };

    // Récupérer les stats initiales
    fetchStats();

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
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Calculer les pourcentages de changement (à implémenter selon vos besoins)
  const calculatePercentage = (current: number, category: keyof CallStats) => {
    // Pour l'exemple, retourne 0
    // À implémenter avec la comparaison par rapport à la période précédente
    return 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Phone className="w-6 h-6 text-white" />}
        title="Total des appels"
        value={stats.total}
        percentage={calculatePercentage(stats.total, 'total')}
        color="bg-blue-500"
        category="total"
      />
      
      <StatCard
        icon={<CheckCircle className="w-6 h-6 text-white" />}
        title="Demandes info + Cas traités"
        value={stats.info}
        percentage={calculatePercentage(stats.info, 'info')}
        color="bg-green-500"
        category="info"
      />
      
      <StatCard
        icon={<AlertTriangle className="w-6 h-6 text-white" />}
        title="Problèmes signalés"
        value={stats.problem}
        percentage={calculatePercentage(stats.problem, 'problem')}
        color="bg-orange-500"
        category="problem"
      />
      
      <StatCard
        icon={<AlertOctagon className="w-6 h-6 text-white" />}
        title="Incident Prioritaire"
        value={stats.critical}
        percentage={calculatePercentage(stats.critical, 'critical')}
        color="bg-red-500"
        category="critical"
      />
    </div>
  );
}
