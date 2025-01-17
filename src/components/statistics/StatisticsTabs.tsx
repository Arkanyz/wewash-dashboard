import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, AlertCircle, CheckCircle2, Timer } from "lucide-react";
import { Card } from "../ui/card";
import { statisticsService } from "../../services/statisticsService";
import { DataState } from "../ui/data-state";
import CallsAnalysis from "./calls-analysis/CallsAnalysis";
import MachinesStatus from "./machines-status/MachinesStatus";
import RecurringIssuesTab from "./recurring-issues/RecurringIssuesTab";
import { CALL_CATEGORIES } from "../../types/callTypes";

const StatisticsTabs: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCalls: 0,
    categoryBreakdown: {} as Record<string, number>,
    criticalIncidents: 0,
    trends: {
      calls: '+0%',
      categories: {} as Record<string, string>,
      critical: '+0%'
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
      case 'technical':
      case 'payment':
        setSelectedTab(0);
        break;
      case 'critical':
        setSelectedTab(1);
        break;
      default:
        setSelectedTab(0);
    }
  };

  return (
    <div className="space-y-6">
      <DataState
        isLoading={loading}
        error={error}
        isEmpty={!stats.totalCalls && !Object.values(stats.categoryBreakdown).every(v => v === 0)}
        loadingMessage="Chargement des statistiques..."
        emptyMessage="Aucune donnée statistique n'est disponible pour le moment. Les données apparaîtront dès que des appels ou incidents seront enregistrés."
        errorMessage={error || "Une erreur est survenue lors du chargement des données"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total des appels */}
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
              <div className="text-sm font-medium text-green-600">
                {stats.trends.calls}
              </div>
            </div>
          </Card>

          {/* Problèmes techniques */}
          <Card 
            className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-red-500 bg-white"
            onClick={() => handleCardClick('technical')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">{CALL_CATEGORIES.technical_issue}</h3>
                  <p className="text-2xl font-bold">{stats.categoryBreakdown.technical_issue || 0}</p>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">
                {stats.trends.categories.technical_issue}
              </div>
            </div>
          </Card>

          {/* Problèmes de paiement */}
          <Card 
            className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-yellow-500 bg-white"
            onClick={() => handleCardClick('payment')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <Timer className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">{CALL_CATEGORIES.payment_issue}</h3>
                  <p className="text-2xl font-bold">{stats.categoryBreakdown.payment_issue || 0}</p>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">
                {stats.trends.categories.payment_issue}
              </div>
            </div>
          </Card>

          {/* Incidents critiques */}
          <Card 
            className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-purple-500 bg-white"
            onClick={() => handleCardClick('critical')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <CheckCircle2 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Incidents critiques</h3>
                  <p className="text-2xl font-bold">{stats.criticalIncidents}</p>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">
                {stats.trends.critical}
              </div>
            </div>
          </Card>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                  ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                  ${selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2">
            <AnimatePresence mode="wait">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className={`rounded-xl bg-white p-3
                    ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <tab.component />
                  </motion.div>
                </Tab.Panel>
              ))}
            </AnimatePresence>
          </Tab.Panels>
        </Tab.Group>
      </DataState>
    </div>
  );
};

export default StatisticsTabs;
