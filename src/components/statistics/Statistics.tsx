import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../providers/SupabaseProvider';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Loader2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Users,
  AlertTriangle,
  Wrench,
  Filter,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
  dailyStats: {
    date: string;
    incidents: number;
    interventions: number;
  }[];
  trends: {
    laundries: number;
    machines: number;
    incidents: number;
    interventions: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData>({
    totalLaundries: 0,
    totalMachines: 0,
    totalIncidents: 0,
    totalInterventions: 0,
    incidentTypes: [],
    machineUsage: [],
    dailyStats: [],
    trends: {
      laundries: 0,
      machines: 0,
      incidents: 0,
      interventions: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedLaundry, setSelectedLaundry] = useState<string>('all');
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchStatistics();
  }, [timeRange, selectedLaundry]);

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

      // Simuler des données pour les graphiques
      const mockIncidentTypes = [
        { type: 'Panne machine', count: 45 },
        { type: 'Problème électrique', count: 30 },
        { type: 'Fuite d\'eau', count: 25 },
        { type: 'Problème logiciel', count: 20 },
        { type: 'Autre', count: 10 }
      ];

      const mockDailyStats = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        incidents: Math.floor(Math.random() * 10),
        interventions: Math.floor(Math.random() * 8)
      }));

      setStats({
        totalLaundries: laundriesCount || 0,
        totalMachines: machinesCount || 0,
        totalIncidents: incidentsCount || 0,
        totalInterventions: interventionsCount || 0,
        incidentTypes: mockIncidentTypes,
        machineUsage: [],
        dailyStats: mockDailyStats,
        trends: {
          laundries: 15,
          machines: 8,
          incidents: -12,
          interventions: -5
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, trend, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
        </div>
      </div>
      <h3 className="text-lg text-gray-600 dark:text-gray-300 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value.toLocaleString()}</p>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord statistique</h1>
          <p className="text-gray-500 dark:text-gray-400">Analysez les performances de vos laveries</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Filtres */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              className="bg-transparent border-none text-sm focus:ring-0"
              value={selectedLaundry}
              onChange={(e) => setSelectedLaundry(e.target.value)}
            >
              <option value="all">Toutes les laveries</option>
              <option value="paris">Paris</option>
              <option value="lyon">Lyon</option>
            </select>
          </div>

          {/* Période */}
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as 'week' | 'month' | 'year')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Laveries"
          value={stats.totalLaundries}
          trend={stats.trends.laundries}
          icon={Users}
          color="bg-blue-100 text-blue-500"
          subtitle="Actives ce mois"
        />
        <StatCard
          title="Machines"
          value={stats.totalMachines}
          trend={stats.trends.machines}
          icon={BarChartIcon}
          color="bg-green-100 text-green-500"
          subtitle="En service"
        />
        <StatCard
          title="Incidents"
          value={stats.totalIncidents}
          trend={stats.trends.incidents}
          icon={AlertTriangle}
          color="bg-red-100 text-red-500"
          subtitle="Ce mois"
        />
        <StatCard
          title="Interventions"
          value={stats.totalInterventions}
          trend={stats.trends.interventions}
          icon={Wrench}
          color="bg-yellow-100 text-yellow-500"
          subtitle="Réalisées"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité quotidienne */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activité quotidienne</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="interventions"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Types d'incidents */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Types d'incidents</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.incidentTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.incidentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance des machines */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance des machines</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Bar dataKey="incidents" fill="#EF4444" />
                <Bar dataKey="interventions" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
