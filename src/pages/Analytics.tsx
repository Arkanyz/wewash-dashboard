import React, { useState } from 'react';
import { LineChart, BarChart2, PieChart, Calendar, Download, Filter } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');

  const stats: StatCard[] = [
    {
      title: "Taux de disponibilité",
      value: "98.5%",
      change: "+2.1%",
      trend: "up",
      icon: LineChart
    },
    {
      title: "Incidents résolus",
      value: "245",
      change: "-12%",
      trend: "down",
      icon: BarChart2
    },
    {
      title: "Temps moyen de résolution",
      value: "2h 15min",
      change: "-8%",
      trend: "up",
      icon: PieChart
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Statistiques & Analyses</h1>
          <p className="text-gray-400 mt-1">Visualisez et analysez les performances du réseau</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Filtre période */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] text-white rounded-lg border border-[#1E90FF]/10 hover:border-[#1E90FF]/30">
            <Calendar className="w-4 h-4" />
            <span>Cette année</span>
          </button>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF] text-white rounded-lg hover:bg-[#1E90FF]/90">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[#1E1E1E] rounded-xl p-6 border border-[#1E90FF]/10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl font-semibold text-white mt-2">{stat.value}</h3>
                </div>
                <div className="p-3 bg-[#1E90FF]/10 rounded-lg">
                  <Icon className="w-6 h-6 text-[#1E90FF]" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.change}
                </span>
                <span className="text-gray-400 text-sm ml-2">vs mois dernier</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique principal */}
        <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#1E90FF]/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Performance mensuelle</h3>
            <button className="p-2 hover:bg-[#1E90FF]/10 rounded-lg">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            Graphique à implémenter
          </div>
        </div>

        {/* Distribution des incidents */}
        <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#1E90FF]/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Distribution des incidents</h3>
            <button className="p-2 hover:bg-[#1E90FF]/10 rounded-lg">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            Graphique à implémenter
          </div>
        </div>
      </div>

      {/* Tableau des alertes */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#1E90FF]/10">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Alertes récentes</h3>
          <div className="text-gray-400">
            Tableau des alertes à implémenter
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
