import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, CheckCircle, Clock, BarChart3, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { statisticsService, type CallStatistics } from "../../../services/statisticsService";
import { DataState } from "../../ui/data-state";
import { Card } from "../../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface CallsAnalysisProps {
  selectedMetric?: string;
}

const timeRanges = [
  { label: '7 derniers jours', days: 7 },
  { label: '30 derniers jours', days: 30 },
  { label: '3 derniers mois', days: 90 },
  { label: '12 derniers mois', days: 365 }
];

const CallsAnalysis: React.FC<CallsAnalysisProps> = ({ selectedMetric }) => {
  const [selectedRange, setSelectedRange] = useState(timeRanges[0]);
  const [statistics, setStatistics] = useState<CallStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedRange, selectedMetric]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - selectedRange.days);
      
      let type = null;
      if (selectedMetric === 'info') {
        type = 'information';
      } else if (selectedMetric === 'problem') {
        type = 'problem';
      }

      const data = await statisticsService.getCallStatistics({ start, end, type });
      setStatistics(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const getSummaryCards = () => {
    if (!statistics) return null;

    const cards = [
      {
        title: 'Total des appels',
        value: statistics.summary.total,
        icon: <Phone className="h-5 w-5 text-blue-500" />,
        color: 'border-blue-500'
      },
      {
        title: 'Demandes d\'information',
        value: statistics.summary.info,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        color: 'border-green-500'
      },
      {
        title: 'Problèmes signalés',
        value: statistics.summary.problem,
        icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        color: 'border-orange-500'
      },
      {
        title: 'Temps de réponse moyen',
        value: statistics.summary.avgResponseTime,
        icon: <Clock className="h-5 w-5 text-purple-500" />,
        color: 'border-purple-500'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            className={`p-4 ${card.color} bg-white`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">{card.title}</h3>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DataState
        isLoading={loading}
        error={error}
        isEmpty={!statistics || statistics.dailyCalls.length === 0}
        loadingMessage="Chargement des statistiques d'appels..."
        errorMessage={error || "Une erreur est survenue lors du chargement des données"}
        emptyMessage="Aucune donnée d'appel n'est disponible pour la période sélectionnée."
      >
        <div>
          {/* Sélecteur de période */}
          <div className="flex space-x-2 mb-6">
            {timeRanges.map((range) => (
              <button
                key={range.days}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Cartes de résumé */}
          {getSummaryCards()}

          {/* Graphique */}
          {statistics && statistics.dailyCalls.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Évolution des appels
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.dailyCalls}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="#3B82F6" />
                    <Bar dataKey="info" name="Informations" fill="#22C55E" />
                    <Bar dataKey="problem" name="Problèmes" fill="#F97316" />
                    <Bar dataKey="resolved" name="Résolus" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </DataState>
    </div>
  );
};

export default CallsAnalysis;
