import React from 'react';
import { Phone, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface DashboardStatsProps {
  className?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = React.useState({
    total_calls: { total_count: 0, percentage_change: 0 },
    info: { total_count: 0, percentage_change: 0 },
    issues: { total_count: 0, percentage_change: 0 },
    critical: { total_count: 0, absolute_change: 0 }
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      // Fetch stats from Supabase
      const { data: statsData, error } = await supabase
        .rpc('get_dashboard_statistics');

      if (!error && statsData) {
        setStats(statsData);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total des appels',
      value: stats.total_calls.total_count,
      change: `${stats.total_calls.percentage_change}%`,
      icon: <Phone className="w-8 h-8" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Demandes info + Cas traités',
      value: stats.info.total_count,
      change: `${stats.info.percentage_change}%`,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'bg-green-500'
    },
    {
      title: 'Problèmes signalés',
      value: stats.issues.total_count,
      change: `${stats.issues.percentage_change}%`,
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Incident Prioritaire',
      value: stats.critical.total_count,
      change: stats.critical.absolute_change.toString(),
      icon: <AlertCircle className="w-8 h-8" />,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-[0_10px_50px_rgba(8,_112,_184,_0.7)] hover:shadow-[0_20px_70px_rgba(8,_112,_184,_0.2)] transform hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className={`p-4 ${stat.color} rounded-2xl shadow-lg`}>
              <div className="text-white">
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className={`flex items-center px-2 py-1 rounded-full ${
                  !stat.change.startsWith('-') ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  <span className={`text-sm font-semibold ${
                    !stat.change.startsWith('-') ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
