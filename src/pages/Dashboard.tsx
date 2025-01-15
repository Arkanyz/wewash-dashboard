import React, { useState, useEffect } from 'react';
import WeLineWidget from '../../components/weline/WeLineWidget';
import ActiveIncidents from '../../components/incidents/ActiveIncidents';
import StrategicRecommendations from '../../components/recommendations/StrategicRecommendations';
import AIAssistant from '../../components/ai/AIAssistant';
import TasksList from '../../components/tasks/TasksList';
import Modal from '../../components/ui/Modal';
import CloseButton from '../../components/ui/close-button';
import { ResponsiveLine } from '@nivo/line';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { 
  Trash2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  X, 
  Wrench, 
  ChartBar, 
  Calendar,
  Users,
  MessageSquare,
  Phone
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  location: string;
  timeAgo: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  machineId: string;
  description?: string;
  aiResolved: boolean;
  createdAt: Date;
}

interface MaintenanceRequest {
  incidentId: string;
  priority: 'urgent' | 'normal' | 'low';
  description: string;
  preferredDate?: Date;
  technicianSpeciality?: string[];
}

interface AnalysisData {
  status: 'critical' | 'warning' | 'normal';
  technicalDetails: {
    type: string;
    value: string;
    status: 'normal' | 'warning' | 'critical';
  }[];
  requiresTechnician: boolean;
  recommendedAction: string;
  estimatedDuration: string;
}

const Dashboard: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Données des incidents
  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Panne machine à laver #123',
      location: 'Laverie Paris 15',
      timeAgo: 'Il y a 15min',
      severity: 'high',
      type: 'Panne',
      machineId: '123',
      description: 'La machine ne démarre plus et émet un bruit anormal',
      aiResolved: false,
      createdAt: new Date(2025, 0, 2, 19, 21) // 2025-01-02 19:21
    },
    {
      id: '2',
      title: 'Maintenance préventive #456',
      location: 'Laverie Lyon Centre',
      timeAgo: 'Il y a 1h',
      severity: 'medium',
      type: 'Maintenance',
      machineId: '456',
      description: 'Maintenance régulière programmée',
      aiResolved: false,
      createdAt: new Date(2025, 0, 2, 18, 36) // 2025-01-02 18:36
    },
    {
      id: '3',
      title: 'Vérification routine #789',
      location: 'Laverie Marseille Port',
      timeAgo: 'Il y a 2h',
      severity: 'low',
      type: 'Vérification',
      machineId: '789',
      description: 'Vérification des paramètres de fonctionnement',
      aiResolved: false,
      createdAt: new Date(2025, 0, 2, 17, 36) // 2025-01-02 17:36
    },
    {
      id: '4',
      title: 'Erreur système #234',
      location: 'Laverie Nice Centre',
      timeAgo: 'Il y a 30min',
      severity: 'medium',
      type: 'Erreur',
      machineId: '234',
      description: 'Erreur système détectée',
      aiResolved: true, // Résolu par l'IA
      createdAt: new Date(2025, 0, 2, 19, 6) // 2025-01-02 19:06
    },
    {
      id: '5',
      title: 'Problème température #567',
      location: 'Laverie Bordeaux Sud',
      timeAgo: 'Il y a 45min',
      severity: 'high',
      type: 'Panne',
      machineId: '567',
      description: 'Température anormalement élevée',
      aiResolved: false,
      createdAt: new Date(2025, 0, 2, 18, 51) // 2025-01-02 18:51
    }
  ];

  // Fonction pour obtenir les 3 incidents les plus récents non résolus par l'IA
  const getRecentUnresolvedIncidents = (allIncidents: Incident[]) => {
    return allIncidents
      .filter(incident => !incident.aiResolved) // Filtre les incidents non résolus par l'IA
      .sort((a, b) => {
        // D'abord par sévérité
        const severityOrder = { high: 0, medium: 1, low: 2 };
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        
        // Si même sévérité, trier par date
        if (severityDiff === 0) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        
        return severityDiff;
      })
      .slice(0, 3); // Prendre les 3 premiers
  };

  const activeIncidents = getRecentUnresolvedIncidents(incidents);

  // Données des statistiques
  const statsData = {
    'vapi-calls': {
      title: 'Appels VAPI (24h)',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      details: [
        { period: '0-6h', value: '32' },
        { period: '6-12h', value: '45' },
        { period: '12-18h', value: '48' },
        { period: '18-24h', value: '31' }
      ]
    },
    'resolution-rate': {
      title: 'Taux de résolution',
      value: '92%',
      change: '+5%',
      changeType: 'positive',
      details: [
        { period: 'Aujourd\'hui', value: '92%' },
        { period: 'Cette semaine', value: '89%' },
        { period: 'Ce mois', value: '87%' }
      ]
    },
    'average-time': {
      title: 'Temps moyen',
      value: '2h 15min',
      change: '+15min',
      changeType: 'negative',
      details: [
        { period: 'Aujourd\'hui', value: '2h 15min' },
        { period: 'Cette semaine', value: '2h 05min' },
        { period: 'Ce mois', value: '2h 30min' }
      ]
    },
    'active-machines': {
      title: 'Machines actives',
      value: '245/280',
      change: '87%',
      changeType: 'positive',
      details: [
        { period: 'En maintenance', value: '15' },
        { period: 'En panne', value: '20' },
        { period: 'En service', value: '245' }
      ]
    }
  };

  // Données horaires améliorées
  const generateHourlyData = () => {
    return Array.from({ length: 24 }, (_, hour) => ({
      x: `${hour}h`,
      y: Math.floor(Math.random() * 20) + 1
    }));
  };

  const [hourlyData, setHourlyData] = useState(generateHourlyData());

  useEffect(() => {
    const interval = setInterval(() => {
      setHourlyData(generateHourlyData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Style personnalisé pour le graphique
  const bubbleChartTheme = {
    background: 'transparent',
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    textColor: '#286BD4',
    tooltip: {
      container: {
        background: '#F9F9F9',
        fontSize: '12px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '12px 16px',
      }
    },
    labels: {
      text: {
        fontSize: 12,
        fill: '#286BD4',
        fontWeight: 600
      }
    }
  };

  // Ajout de l'interface pour les tâches
  interface Task {
    id: string;
    title: string;
    description: string;
    timeLeft: string;
    location: string;
    urgencyLevel: 'high' | 'medium' | 'low';
    aiConfidence: number;
    isPriority?: boolean;
  }

  // Simulation des tâches avec données IA
  const allTasks: Task[] = [
    // Tâches prioritaires
    {
      id: '1',
      title: 'Terminal de paiement bloqué',
      description: 'Le terminal ne répond plus aux transactions',
      timeLeft: '2h 15min',
      location: 'Paris 11ème - Machine #123',
      urgencyLevel: 'high',
      aiConfidence: 0.89,
      isPriority: true
    },
    {
      id: '2',
      title: 'Maintenance préventive',
      description: 'Vérification des filtres et courroies',
      timeLeft: '1h 45min',
      location: 'Lyon Centre - Machine #45',
      urgencyLevel: 'medium',
      aiConfidence: 0.75,
      isPriority: true
    },
    // Tâches non prioritaires
    {
      id: '3',
      title: 'Mise à jour logicielle',
      description: 'Installation des dernières mises à jour de sécurité',
      timeLeft: '24h',
      location: 'Marseille Nord - Machine #78',
      urgencyLevel: 'low',
      aiConfidence: 0.68,
      isPriority: false
    },
    {
      id: '4',
      title: 'Nettoyage périodique',
      description: 'Nettoyage approfondi des machines',
      timeLeft: '48h',
      location: 'Nice Centre - Machine #92',
      urgencyLevel: 'low',
      aiConfidence: 0.72,
      isPriority: false
    }
  ];

  const [tasks, setTasks] = useState<Task[]>(allTasks);

  const priorityTasks = tasks.filter(task => task.isPriority);
  const nonPriorityTasks = tasks.filter(task => !task.isPriority);

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white border border-[#E5E9F2] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Version Mobile */}
      <div className="block sm:hidden">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className={`text-xs font-medium flex items-center gap-1.5
              ${task.urgencyLevel === 'high' 
                ? 'text-red-600' 
                : task.urgencyLevel === 'medium'
                ? 'text-orange-600'
                : 'text-green-600'
              }`}
          >
            <span className="mr-1">●</span>
            <span>
              {task.urgencyLevel === 'high' 
                ? 'Urgent' 
                : task.urgencyLevel === 'medium' 
                ? 'Modéré' 
                : 'Normal'}
            </span>
          </div>
          <span className="text-[10px] text-[#666666] bg-[#F5F7FA] px-1.5 py-0.5 rounded">
            Recommandé par l'assistant
          </span>
        </div>

        <h4 className="text-[#1a1a1a] font-medium mb-1">{task.title}</h4>
        <p className="text-xs text-[#666666] mb-2">{task.description}</p>

        <div className="flex items-center text-xs text-[#666666] gap-3">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1 text-[#286BD4]" />
            {task.timeLeft}
          </span>
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-[#286BD4]" />
            {task.location}
          </span>
        </div>
      </div>

      {/* Version Desktop */}
      <div className="hidden sm:block">
        <div className="flex justify-between items-start group">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="text-[#1a1a1a] font-medium">{task.title}</h4>
              <div 
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5
                  ${task.urgencyLevel === 'high' 
                    ? 'bg-red-50 text-red-600' 
                    : task.urgencyLevel === 'medium'
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-green-50 text-green-600'
                  }`}
              >
                <AlertCircle className="w-3 h-3" />
                <span>
                  {task.urgencyLevel === 'high' 
                    ? 'Urgent' 
                    : task.urgencyLevel === 'medium' 
                    ? 'Modéré' 
                    : 'Normal'}
                </span>
              </div>
              <div className="ml-auto text-xs text-[#666666] bg-[#F5F7FA] px-2 py-1 rounded-md">
                Recommandé<br />par l'assistant
              </div>
            </div>
            <p className="text-sm text-[#666666] mb-4">{task.description}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Clock className="w-4 h-4 text-[#286BD4]" />
                {task.timeLeft}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <MapPin className="w-4 h-4 text-[#286BD4]" />
                {task.location}
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-[#FF6666]';
      case 'medium':
        return 'bg-[#FFA500]';
      case 'low':
        return 'bg-[#FFD700]';
    }
  };

  const IncidentCard = ({ incident, onClick }: { 
    incident: Incident;
    onClick: (incident: Incident) => void;
  }) => {
    const getSeverityInfo = (severity: Incident['severity']) => {
      switch (severity) {
        case 'high':
          return {
            color: 'bg-red-500',
            gradient: 'from-red-500/10 to-transparent',
            text: 'Critique',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50'
          };
        case 'medium':
          return {
            color: 'bg-orange-500',
            gradient: 'from-orange-500/10 to-transparent',
            text: 'Modéré',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50'
          };
        case 'low':
          return {
            color: 'bg-yellow-500',
            gradient: 'from-yellow-500/10 to-transparent',
            text: 'Normal',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          };
      }
    };

    const severityInfo = getSeverityInfo(incident.severity);

    return (
      <div 
        onClick={() => onClick(incident)}
        className="group relative bg-white rounded-xl border border-[#E5E9F2] hover:border-[#286BD4] transition-all duration-200 cursor-pointer"
      >
        <div className={`absolute top-0 left-0 w-1 h-full ${severityInfo.color} rounded-l-xl`} />
        <div className={`absolute top-0 left-0 w-32 h-full bg-gradient-to-r ${severityInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

        <div className="relative p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityInfo.bgColor} ${severityInfo.textColor}`}>
              {severityInfo.text}
            </span>
            <span className="text-xs text-[#666666]">{incident.timeAgo}</span>
          </div>
          
          <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">{incident.title}</h3>
          
          <div className="flex items-center gap-2 text-xs text-[#666666]">
            <MapPin className="w-3 h-3 text-[#286BD4]" />
            {incident.location}
          </div>
        </div>
      </div>
    );
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowAnalysisModal(true);
  };

  const AnalysisModal = () => {
    const analysisData: AnalysisData = {
      status: 'warning',
      technicalDetails: [
        { type: 'Température', value: '75°C', status: 'critical' },
        { type: 'Pression', value: '2.4 bar', status: 'normal' },
        { type: 'Vibration', value: 'Modérée', status: 'warning' }
      ],
      requiresTechnician: true,
      recommendedAction: 'Maintenance préventive recommandée pour optimiser les performances',
      estimatedDuration: '2-3 heures'
    };

    return (
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${showAnalysisModal ? '' : 'hidden'}`}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1a1a1a]">Analyse Détaillée</h3>
              <p className="text-sm text-[#666666]">Machine #5 - Lyon Centre</p>
            </div>
            <CloseButton onClick={() => setShowAnalysisModal(false)} />
          </div>

          {/* Contenu */}
          <div>
            {/* Détails techniques */}
            <div className="space-y-3 mb-6">
              {analysisData.technicalDetails.map((detail, index) => (
                <div key={index} className="flex items-center justify-between bg-[#FAFBFF] rounded-xl p-4 border border-[#E5E9F2]">
                  <p className="text-sm text-[#666666]">{detail.type}</p>
                  <p className={`text-sm font-medium ${
                    detail.status === 'critical' ? 'text-red-600' :
                    detail.status === 'warning' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recommandations */}
            <div className="bg-[#FAFBFF] rounded-xl p-4 border border-[#E5E9F2] mb-6">
              <h4 className="text-base font-medium text-[#1a1a1a] mb-2">Recommandations</h4>
              <p className="text-sm text-[#666666]">{analysisData.recommendedAction}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-[#666666]">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#286BD4]" />
                  Durée estimée: {analysisData.estimatedDuration}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button 
                className="px-6 py-2.5 text-white bg-gradient-to-r from-[#286BD4] to-[#3B7BE9] rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                Planifier une intervention
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TasksModal = () => (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${showAllTasks ? '' : 'hidden'}`}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#1a1a1a]">Toutes les tâches</h3>
          <CloseButton onClick={() => setShowAllTasks(false)} />
        </div>
        <div className="space-y-4">
          {nonPriorityTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button 
            className="px-6 py-2.5 text-white bg-gradient-to-r from-[#286BD4] to-[#3B7BE9] rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            onClick={() => setShowAllTasks(false)}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );

  const ModalContent = () => {
    return (
      <div className="space-y-6">
        {/* Graphique */}
        <div className="h-64 bg-[#FAFBFF] rounded-xl p-4">
          <ResponsiveLine
            data={[
              {
                id: selectedStat,
                data: statsData[selectedStat].details.map((detail, index) => ({
                  x: detail.period,
                  y: parseFloat(detail.value) || 0
                }))
              }
            ]}
            margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
            curve="monotoneX"
            enablePoints={true}
            pointSize={8}
            pointColor="#286BD4"
            pointBorderWidth={2}
            pointBorderColor="#ffffff"
            colors={["#286BD4"]}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: "#666666",
                    fontSize: 12
                  }
                }
              },
              grid: {
                line: {
                  stroke: "#E5E9F2"
                }
              }
            }}
          />
        </div>

        {/* Détails */}
        <div className="grid grid-cols-2 gap-4">
          {statsData[selectedStat].details.map((detail, index) => (
            <div key={index} className="bg-[#FAFBFF] rounded-xl p-4 border border-[#E5E9F2]">
              <p className="text-sm text-[#666666] mb-1">{detail.period}</p>
              <p className="text-lg font-semibold text-[#1a1a1a]">{detail.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button 
            className="px-6 py-2.5 text-white bg-gradient-to-r from-[#286BD4] to-[#3B7BE9] rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            Exporter les données
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#F9F9F9]">
      <div className="h-full p-4">
        <div className="h-full max-w-[1800px] mx-auto grid grid-rows-[auto_1fr_1fr] gap-3">
          <DashboardStats className="mb-8" />
          {/* Indicateurs clés - hauteur automatique */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(statsData).map(([key, stat]) => (
              <div
                key={key}
                className="bg-white rounded-2xl p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedStat(key)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#121212] font-medium text-sm">{stat.title}</p>
                    <h3 className="text-xl font-semibold text-[#286BD4] mt-1">{stat.value}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-sm ${
                    stat.changeType === 'positive' ? 'bg-[#DAF4D8] text-[#38AF2E]' : 'bg-[#FED6D6] text-[#FF6666]'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ligne du milieu - tâches et incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Tâches & Actions préventives */}
            <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1a1a1a]">Tâches & Actions préventives</h2>
                  <p className="text-sm text-[#666666]">Gérez vos tâches en cours</p>
                </div>
                <button 
                  onClick={() => setShowAllTasks(true)}
                  className="w-8 h-8 bg-gradient-to-r from-[#286BD4] to-[#3B7BE9] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center shadow-sm"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>

              <div className="bg-[#FAFBFF] border border-[#E5E9F2] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-medium text-[#1a1a1a]">Tâches Prioritaires</h3>
                  <span className="px-2 py-1 bg-white text-sm text-[#286BD4] rounded-full border border-[#E5E9F2] shadow-sm">
                    {priorityTasks.length} tâches
                  </span>
                </div>

                <div className="space-y-2">
                  {priorityTasks.slice(0, 3).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            </div>

            {/* Incidents Actifs */}
            <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1a1a1a]">Incidents Actifs</h2>
                  <p className="text-sm text-[#666666]">3 incidents les plus urgents non résolus</p>
                </div>
              </div>

              <div className="space-y-2">
                {activeIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onClick={handleIncidentClick}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ligne du bas - recommandations et assistant */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recommandations Stratégiques */}
            <StrategicRecommendations />

            {/* Assistant IA */}
            <AIAssistant />
          </div>
        </div>
      </div>

      {/* Modales */}
      <TasksModal />
      <AnalysisModal />
      <Modal
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        title={selectedStat ? statsData[selectedStat].title : ''}
      >
        {selectedStat && (
          <div className="space-y-6">
            {/* Graphique */}
            <div className="h-64 bg-[#FAFBFF] rounded-xl p-4">
              <ResponsiveLine
                data={[
                  {
                    id: selectedStat,
                    data: statsData[selectedStat].details.map((detail, index) => ({
                      x: detail.period,
                      y: parseFloat(detail.value) || 0
                    }))
                  }
                ]}
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                curve="monotoneX"
                enablePoints={true}
                pointSize={8}
                pointColor="#286BD4"
                pointBorderWidth={2}
                pointBorderColor="#ffffff"
                colors={["#286BD4"]}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fill: "#666666",
                        fontSize: 12
                      }
                    }
                  },
                  grid: {
                    line: {
                      stroke: "#E5E9F2"
                    }
                  }
                }}
              />
            </div>

            {/* Détails */}
            <div className="grid grid-cols-2 gap-4">
              {statsData[selectedStat].details.map((detail, index) => (
                <div key={index} className="bg-[#FAFBFF] rounded-xl p-4 border border-[#E5E9F2]">
                  <p className="text-sm text-[#666666] mb-1">{detail.period}</p>
                  <p className="text-lg font-semibold text-[#1a1a1a]">{detail.value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button 
                className="px-6 py-2.5 text-white bg-gradient-to-r from-[#286BD4] to-[#3B7BE9] rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                Exporter les données
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Dashboard;
