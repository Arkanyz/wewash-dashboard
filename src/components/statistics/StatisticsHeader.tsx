import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { supabase } from "../../lib/supabaseClient";

interface StatisticsHeaderProps {
  className?: string;
}

export const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({ className = '' }) => {
  const [stats, setStats] = React.useState({
    vapi_calls: { count: 156, change: '+12%' },
    resolution_rate: { value: '92%', change: '+5%' },
    average_time: { value: '2h 15min', change: '+15min' },
    active_machines: { count: 245, total: 280, percentage: '87%' }
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      // Fetch stats from Supabase
      const { data: statsData, error } = await supabase
        .rpc('get_statistics_header_data');

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
      title: 'Appels VAPI (24h)',
      value: stats.vapi_calls.count,
      change: stats.vapi_calls.change,
      valueColor: 'text-blue-600'
    },
    {
      title: 'Taux de résolution',
      value: stats.resolution_rate.value,
      change: stats.resolution_rate.change,
      valueColor: 'text-blue-600'
    },
    {
      title: 'Temps moyen',
      value: stats.average_time.value,
      change: stats.average_time.change,
      valueColor: 'text-blue-600'
    },
    {
      title: 'Machines actives',
      value: `${stats.active_machines.count}/${stats.active_machines.total}`,
      change: stats.active_machines.percentage,
      valueColor: 'text-blue-600'
    }
  ];

  const getChangeStyle = (change: string) => {
    if (change.startsWith('+')) {
      return 'bg-green-100 text-green-800';
    } else if (change.startsWith('-')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-[0_10px_50px_rgba(8,_112,_184,_0.1)] hover:shadow-[0_20px_70px_rgba(8,_112,_184,_0.2)] transform hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${getChangeStyle(stat.change)}`}>
                {stat.change}
              </div>
            </div>
            <p className={`text-2xl font-semibold ${stat.valueColor}`}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
