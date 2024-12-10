import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../providers/SupabaseProvider';
import { BarChart, LineChart, PieChart, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

interface StatisticsData {
  totalLaundries: number;
  totalMachines: number;
  totalIncidents: number;
  totalInterventions: number;
  incidentTypes: {
    type: string;
    count: number;
  }[];
  machineUsage: {
    machineId: string;
    usageCount: number;
  }[];
  trends: {
    laundries: number;
    machines: number;
    incidents: number;
    interventions: number;
  };
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData>({
    totalLaundries: 0,
    totalMachines: 0,
    totalIncidents: 0,
    totalInterventions: 0,
    incidentTypes: [],
    machineUsage: [],
    trends: {
      laundries: 0,
      machines: 0,
      incidents: 0,
      interventions: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);

      // Récupérer les statistiques actuelles
      const { count: laundriesCount } = await supabase
        .from('laundries')
        .select('*', { count: 'exact' });

      const { count: machinesCount } = await supabase
        .from('machines')
        .select('*', { count: 'exact' });

      const { count: incidentsCount } = await supabase
        .from('incidents')
        .select('*', { count: 'exact' });

      const { count: interventionsCount } = await supabase
        .from('interventions')
        .select('*', { count: 'exact' });

      // Récupérer les tendances (comparaison avec la période précédente)
      const previousPeriodStart = getPreviousPeriodStart(timeRange);
      const currentPeriodStart = getCurrentPeriodStart(timeRange);

      const [previousStats, currentStats] = await Promise.all([
        getStatsForPeriod(previousPeriodStart, currentPeriodStart),
        getStatsForPeriod(currentPeriodStart, new Date())
      ]);

      const trends = calculateTrends(previousStats, currentStats);

      setStats({
        totalLaundries: laundriesCount || 0,
        totalMachines: machinesCount || 0,
        totalIncidents: incidentsCount || 0,
        totalInterventions: interventionsCount || 0,
        incidentTypes: [], // À implémenter avec des données réelles
        machineUsage: [], // À implémenter avec des données réelles
        trends
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviousPeriodStart = (range: 'week' | 'month' | 'year'): Date => {
    const date = new Date();
    switch (range) {
      case 'week':
        date.setDate(date.getDate() - 14);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 2);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 2);
        break;
    }
    return date;
  };

  const getCurrentPeriodStart = (range: 'week' | 'month' | 'year'): Date => {
    const date = new Date();
    switch (range) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    return date;
  };

  const getStatsForPeriod = async (startDate: Date, endDate: Date) => {
    // Implémenter la logique pour récupérer les statistiques sur une période donnée
    return {
      laundries: 0,
      machines: 0,
      incidents: 0,
      interventions: 0
    };
  };

  const calculateTrends = (previous: any, current: any) => {
    return {
      laundries: ((current.laundries - previous.laundries) / previous.laundries) * 100,
      machines: ((current.machines - previous.machines) / previous.machines) * 100,
      incidents: ((current.incidents - previous.incidents) / previous.incidents) * 100,
      interventions: ((current.interventions - previous.interventions) / previous.interventions) * 100
    };
  };

  const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
    <div className="bg-[#1E201F] p-6 rounded-xl hover:bg-[#252725] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
        </div>
      </div>
      <h3 className="text-lg text-gray-400 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#99E5DC]" />
      </div>
    );
  }

  return (
    <div className="bg-[#111313] p-6 rounded-xl h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-6">Statistiques</h1>
        <div className="flex gap-4">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as 'week' | 'month' | 'year')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-[#99E5DC] text-[#1E201F]'
                  : 'bg-[#1E201F] text-gray-400 hover:text-white'
              }`}
            >
              {range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Laveries"
          value={stats.totalLaundries}
          trend={stats.trends.laundries}
          icon={BarChart}
          color="bg-blue-500/20 text-blue-500"
        />
        <StatCard
          title="Machines"
          value={stats.totalMachines}
          trend={stats.trends.machines}
          icon={LineChart}
          color="bg-green-500/20 text-green-500"
        />
        <StatCard
          title="Incidents"
          value={stats.totalIncidents}
          trend={stats.trends.incidents}
          icon={PieChart}
          color="bg-red-500/20 text-red-500"
        />
        <StatCard
          title="Interventions"
          value={stats.totalInterventions}
          trend={stats.trends.interventions}
          icon={BarChart}
          color="bg-yellow-500/20 text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1E201F] p-6 rounded-xl">
          <h2 className="text-lg font-medium text-white mb-4">Types d'incidents</h2>
          <div className="h-64">
            {/* Intégrer ici un graphique circulaire des types d'incidents */}
          </div>
        </div>

        <div className="bg-[#1E201F] p-6 rounded-xl lg:col-span-2">
          <h2 className="text-lg font-medium text-white mb-4">Utilisation des machines</h2>
          <div className="h-64">
            {/* Intégrer ici un graphique d'utilisation des machines */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
