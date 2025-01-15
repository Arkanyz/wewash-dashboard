import React, { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { statisticsService } from '../../services/statisticsService';
import MachinesStatus from './machines-status/MachinesStatus';
import CallsAnalysis from './calls-analysis/CallsAnalysis';
import RecurringIssuesTab from './recurring-issues/RecurringIssuesTab';
import { DataState } from '../ui/data-state';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('calls');
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

  const StatCard = ({ title, value, trend, icon, color, onClick }: any) => (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 ${color} bg-white`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
          <div>
            <h3 className="font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        <span className={`text-sm ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
    </Card>
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total des appels"
            value={stats.totalCalls}
            trend={stats.trends.calls}
            icon={<Phone className="h-5 w-5 text-blue-500" />}
            color="border-blue-500"
            onClick={() => setActiveTab('calls')}
          />
          <StatCard
            title="Demandes Informations + Cas traités"
            value={stats.infoRequests}
            trend={stats.trends.info}
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            color="border-green-500"
            onClick={() => setActiveTab('calls')}
          />
          <StatCard
            title="Problèmes signalés"
            value={stats.problemReports}
            trend={stats.trends.problems}
            icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
            color="border-orange-500"
            onClick={() => setActiveTab('issues')}
          />
          <StatCard
            title="Incidents Prioritaires"
            value={stats.criticalIncidents}
            trend={stats.trends.critical}
            icon={<Timer className="h-5 w-5 text-red-500" />}
            color="border-red-500"
            onClick={() => setActiveTab('machines')}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calls">Analyse des Appels</TabsTrigger>
            <TabsTrigger value="machines">État des Machines</TabsTrigger>
            <TabsTrigger value="issues">Problèmes Récurrents</TabsTrigger>
          </TabsList>

          <TabsContent value="calls">
            <CallsAnalysis selectedMetric={activeTab} />
          </TabsContent>

          <TabsContent value="machines">
            <MachinesStatus selectedMetric={activeTab} />
          </TabsContent>

          <TabsContent value="issues">
            <RecurringIssuesTab selectedMetric={activeTab} />
          </TabsContent>
        </Tabs>
      </DataState>
    </div>
  );
};

export default Statistics;
