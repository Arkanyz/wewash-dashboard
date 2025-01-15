import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { statisticsService } from '../../../services/statisticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DataState } from '../../ui/data-state';

interface IssueStats {
  byMachine: {
    machine_id: string;
    machine_name: string;
    count: number;
    issues: string[];
  }[];
  byType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  totalIssues: number;
  avgResolutionTime: number;
  criticalIssues: number;
}

interface RecurringIssuesTabProps {
  selectedMetric: string | null;
}

const COLORS = ['#286BD4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const RecurringIssuesTab: React.FC<RecurringIssuesTabProps> = ({ selectedMetric }) => {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    if (selectedMetric === 'critical') {
      // Filtrer pour montrer uniquement les problèmes critiques
    }
  }, [selectedMetric]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - timeRange);

      const data = await statisticsService.getMaintenanceStats({ start, end });
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Les données ne sont pas encore disponibles. Veuillez patienter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <DataState
        isLoading={loading}
        isEmpty={!loading && !error && (!stats || (stats.totalIssues === 0))}
        error={error}
        loadingMessage="Analyse des problèmes récurrents..."
        emptyMessage="Aucun problème récurrent n'a été détecté pour le moment."
      >
        {stats && stats.totalIssues > 0 && (
          <>
            {/* En-tête avec statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="text-[#286BD4]" />
                  <h3 className="text-sm font-medium text-gray-700">Total Problèmes</h3>
                </div>
                <p className="text-2xl font-bold mt-2 text-[#1a1a1a]">{stats.totalIssues}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="text-yellow-500" />
                  <h3 className="text-sm font-medium text-gray-700">Temps Moyen Résolution</h3>
                </div>
                <p className="text-2xl font-bold mt-2 text-[#1a1a1a]">
                  {Math.round(stats.avgResolutionTime)} heures
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-red-500" />
                  <h3 className="text-sm font-medium text-gray-700">Problèmes Critiques</h3>
                </div>
                <p className="text-2xl font-bold mt-2 text-[#1a1a1a]">{stats.criticalIssues}</p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution des types de problèmes */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-[#1a1a1a]">Types de Problèmes</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <DataState
                  isEmpty={!stats.byType || stats.byType.length === 0}
                  emptyMessage="Aucune donnée sur les types de problèmes"
                >
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.byType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {stats.byType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </DataState>
              </div>

              {/* Problèmes par machine */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-[#1a1a1a]">Machines Problématiques</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <DataState
                  isEmpty={!stats.byMachine || stats.byMachine.length === 0}
                  emptyMessage="Aucune donnée sur les machines problématiques"
                >
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.byMachine.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="machine_name" type="category" width={150} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#286BD4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {stats.byMachine.length > 10 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Affichage des 10 machines les plus problématiques sur {stats.byMachine.length}
                    </p>
                  )}
                </DataState>
              </div>
            </div>

            {/* Liste détaillée des problèmes récurrents */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-[#1a1a1a]">Détails par Machine</h3>
              </div>
              <DataState
                isEmpty={!stats.byMachine || stats.byMachine.length === 0}
                emptyMessage="Aucun détail disponible pour les machines"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Machine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre de Problèmes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Problèmes Fréquents
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.byMachine.map((machine) => (
                        <tr key={machine.machine_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {machine.machine_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {machine.count}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <ul className="list-disc list-inside">
                              {machine.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataState>
            </div>
          </>
        )}
      </DataState>
    </motion.div>
  );
};

export default RecurringIssuesTab;
