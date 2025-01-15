import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { statisticsService } from '@/services/statisticsService';
import { DataState } from '@/components/ui/data-state';
import CallsAnalysis from './calls-analysis/CallsAnalysis';
import MachinesStatus from './machines-status/MachinesStatus';
import RecurringIssuesTab from './recurring-issues/RecurringIssuesTab';

const StatisticsTabs: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCalls: 0,
    infoRequests: 0,
    problemReports: 0,
    criticalIncidents: 0,
    trends: {
      calls: '+0%',
      info: '+0%',
      problems: '+0%',
      critical: '+0'
    }
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getStatistics();
      setStats(data);
    } catch (err) {
      setError("Aucune donnée statistique n'est disponible pour le moment");
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      name: 'Analyse des Appels',
      component: CallsAnalysis
    },
    {
      name: 'État des Machines',
      component: MachinesStatus
    },
    {
      name: 'Problèmes Récurrents',
      component: RecurringIssuesTab
    }
  ];

  const handleCardClick = (metricType: string) => {
    switch (metricType) {
      case 'calls':
        setSelectedTab(0);
        break;
      case 'info':
        setSelectedTab(0);
        break;
      case 'problems':
        setSelectedTab(2);
        break;
      case 'critical':
        setSelectedTab(1);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <DataState
        isLoading={loading}
        error={error}
        isEmpty={!stats.totalCalls && !stats.infoRequests && !stats.problemReports && !stats.criticalIncidents}
        loadingMessage="Chargement des statistiques..."
        emptyMessage="Aucune donnée statistique n'est disponible pour le moment. Les données apparaîtront dès que des appels ou incidents seront enregistrés."
        errorMessage={error || "Une erreur est survenue lors du chargement des données"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card 
            className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-blue-500 bg-white"
            onClick={() => handleCardClick('calls')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <Phone className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Total des appels</h3>
                  <p className="text-2xl font-bold">{stats.totalCalls}</p>
                </div>
              </div>
              <span className={`text-sm ${stats.trends.calls.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.trends.calls}
              </span>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-green-500 bg-white"
            onClick={() => handleCardClick('info')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Demandes Informations + Cas traités</h3>
                  <p className="text-2xl font-bold">{stats.infoRequests}</p>
                </div>
              </div>
              <span className={`text-sm ${stats.trends.info.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.trends.info}
              </span>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-orange-500 bg-white"
            onClick={() => handleCardClick('problems')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Problèmes signalés</h3>
                  <p className="text-2xl font-bold">{stats.problemReports}</p>
                </div>
              </div>
              <span className={`text-sm ${stats.trends.problems.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.trends.problems}
              </span>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-red-500 bg-white"
            onClick={() => handleCardClick('critical')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <Timer className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Incidents Prioritaires</h3>
                  <p className="text-2xl font-bold">{stats.criticalIncidents}</p>
                </div>
              </div>
              <span className={`text-sm ${stats.trends.critical.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.trends.critical}
              </span>
            </div>
          </Card>
        </div>

        <div className="flex space-x-2 mb-6">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => setSelectedTab(index)}
              className={`flex items-center justify-center gap-3 py-2.5 px-5 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedTab === index
                  ? 'bg-[#286BD4] text-white shadow-sm'
                  : 'bg-white text-[#2B3674] border border-[#286BD4] hover:bg-[#E8F0FE]'
              }`}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="focus:outline-none"
          >
            {React.createElement(tabs[selectedTab].component, {
              selectedMetric: selectedTab === 0 ? 'all' : selectedTab === 1 ? 'critical' : 'problems'
            })}
          </motion.div>
        </AnimatePresence>
      </DataState>
    </div>
  );
};

export default StatisticsTabs;
