import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  AlertTriangle,
  Info,
  PhoneCall,
  WashingMachine,
  Wrench,
  ArrowRight,
  ChevronDown,
  Clock,
  MapPin,
  AlertCircle,
  RefreshCcw,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Timer,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

interface CallData {
  id: string;
  type: 'information' | 'problem';
  subtype: string;
  date: string;
  laundryName: string;
  machineNumber?: string;
  description: string;
  status: 'resolved' | 'pending' | 'critical';
  frequency?: number;
}

interface MachineData {
  id: string;
  laundryName: string;
  machineNumber: string;
  usage: 'low' | 'medium' | 'high';
  problemsCount: number;
  lastMaintenance: string;
  recommendation: string;
}

interface StatDetail {
  id: string;
  title: string;
  value: string;
  trend?: {
    value: string;
    isUp: boolean;
    period: string;
  };
  details: {
    label: string;
    value: string;
    icon?: React.ElementType;
    color?: string;
  }[];
  chart?: {
    type: 'line' | 'bar' | 'pie';
    data: any; // À typer selon vos besoins
  };
}

const Analytics: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'calls' | 'machines'>('calls');
  const [selectedLaundry, setSelectedLaundry] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  // Données simulées
  const callsData: CallData[] = [
    {
      id: '1',
      type: 'information',
      subtype: 'Horaires',
      date: '2025-01-01 14:30',
      laundryName: 'Laverie Paris 11',
      description: 'Demande d\'horaires d\'ouverture',
      status: 'resolved'
    },
    {
      id: '2',
      type: 'problem',
      subtype: 'Panne',
      date: '2025-01-01 15:45',
      laundryName: 'Laverie Paris 15',
      machineNumber: '45',
      description: 'Machine ne démarre pas',
      status: 'critical',
      frequency: 4
    }
  ];

  const machinesData: MachineData[] = [
    {
      id: '1',
      laundryName: 'Laverie Paris 11',
      machineNumber: '12',
      usage: 'high',
      problemsCount: 5,
      lastMaintenance: '2024-12-25',
      recommendation: 'Maintenance préventive recommandée'
    },
    {
      id: '2',
      laundryName: 'Laverie Paris 15',
      machineNumber: '45',
      usage: 'medium',
      problemsCount: 2,
      lastMaintenance: '2024-12-28',
      recommendation: 'Surveillance accrue conseillée'
    }
  ];

  const statsDetails: Record<string, StatDetail> = {
    'total-calls': {
      id: 'total-calls',
      title: 'Détails des appels',
      value: '156',
      trend: {
        value: '12%',
        isUp: true,
        period: 'vs mois dernier'
      },
      details: [
        {
          label: 'Durée moyenne',
          value: '4.5 min',
          icon: Timer,
          color: 'text-blue-500'
        },
        {
          label: 'Pics d\'appels',
          value: '14h - 16h',
          icon: TrendingUp,
          color: 'text-green-500'
        },
        {
          label: 'Taux de résolution',
          value: '92%',
          icon: CheckCircle,
          color: 'text-purple-500'
        }
      ]
    },
    'info-requests': {
      id: 'info-requests',
      title: 'Demandes d\'information',
      value: '89',
      trend: {
        value: '5%',
        isUp: false,
        period: 'vs mois dernier'
      },
      details: [
        {
          label: 'Questions fréquentes',
          value: 'Horaires (45%)',
          icon: Clock,
          color: 'text-blue-500'
        },
        {
          label: 'Temps de réponse',
          value: '2.3 min',
          icon: Timer,
          color: 'text-green-500'
        },
        {
          label: 'Satisfaction client',
          value: '4.8/5',
          icon: MessageSquare,
          color: 'text-yellow-500'
        }
      ]
    },
    'reported-issues': {
      id: 'reported-issues',
      title: 'Problèmes signalés',
      value: '67',
      trend: {
        value: '8%',
        isUp: true,
        period: 'vs mois dernier'
      },
      details: [
        {
          label: 'Type principal',
          value: 'Panne machine (52%)',
          icon: AlertTriangle,
          color: 'text-red-500'
        },
        {
          label: 'Temps résolution',
          value: '45 min',
          icon: Clock,
          color: 'text-yellow-500'
        },
        {
          label: 'En attente',
          value: '5 problèmes',
          icon: Timer,
          color: 'text-orange-500'
        }
      ]
    },
    'critical-machines': {
      id: 'critical-machines',
      title: 'Machines critiques',
      value: '4',
      trend: {
        value: '2',
        isUp: false,
        period: 'vs semaine dernière'
      },
      details: [
        {
          label: 'Maintenance urgente',
          value: '2 machines',
          icon: Wrench,
          color: 'text-red-500'
        },
        {
          label: 'Surveillance accrue',
          value: '3 machines',
          icon: AlertCircle,
          color: 'text-yellow-500'
        },
        {
          label: 'Prochaine révision',
          value: 'Dans 2 jours',
          icon: Calendar,
          color: 'text-blue-500'
        }
      ]
    }
  };

  const getUsageColor = (usage: MachineData['usage']) => {
    switch (usage) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
    }
  };

  const getStatusColor = (status: CallData['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
    }
  };

  const StatModal: React.FC<{ stat: StatDetail; onClose: () => void }> = ({ stat, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#286BD4]/60 hover:text-[#286BD4] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#286BD4]">{stat.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl font-bold text-[#286BD4]">{stat.value}</span>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend.isUp ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend.isUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.trend.value}</span>
                  <span className="text-[#286BD4]/60 ml-1">{stat.trend.period}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stat.details.map((detail, index) => (
              <div
                key={index}
                className="bg-[#f0f5ff] rounded-xl p-4 flex flex-col items-center text-center"
              >
                {detail.icon && (
                  <detail.icon className={`w-6 h-6 ${detail.color} mb-2`} />
                )}
                <p className="text-sm text-[#286BD4]/60 mb-1">{detail.label}</p>
                <p className="text-lg font-semibold text-[#286BD4]">{detail.value}</p>
              </div>
            ))}
          </div>

          {stat.chart && (
            <div className="bg-[#f0f5ff] rounded-xl p-6">
              <h3 className="text-lg font-medium text-[#286BD4] mb-4">
                Évolution sur 30 jours
              </h3>
              <div className="h-[200px]">
                {/* Intégrer ici le composant de graphique */}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      className="min-h-screen bg-[#F9F9F9] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#286BD4] tracking-tight">
          Statistiques et Analyse
        </h1>
        <p className="text-[#286BD4]/60 mt-2">
          Analyse détaillée des appels et de l'utilisation des machines
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          {
            id: 'total-calls',
            title: 'Total des appels',
            value: '156',
            icon: PhoneCall,
            color: 'bg-blue-500'
          },
          {
            id: 'info-requests',
            title: 'Demandes d\'info',
            value: '89',
            icon: Info,
            color: 'bg-green-500'
          },
          {
            id: 'reported-issues',
            title: 'Problèmes signalés',
            value: '67',
            icon: AlertTriangle,
            color: 'bg-yellow-500'
          },
          {
            id: 'critical-machines',
            title: 'Machines critiques',
            value: '4',
            icon: WashingMachine,
            color: 'bg-red-500'
          }
        ].map((stat) => (
          <motion.div
            key={stat.id}
            className="bg-white p-6 rounded-3xl shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setSelectedStat(stat.id)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <h3 className="text-[#286BD4] font-medium">{stat.title}</h3>
                <p className="text-2xl font-semibold text-[#286BD4]">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal des statistiques */}
      {selectedStat && statsDetails[selectedStat] && (
        <StatModal
          stat={statsDetails[selectedStat]}
          onClose={() => setSelectedStat(null)}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedView('calls')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'calls'
              ? 'bg-[#286BD4] text-white'
              : 'bg-white text-[#286BD4] hover:bg-[#f0f5ff]'
          }`}
        >
          Analyse des Appels
        </button>
        <button
          onClick={() => setSelectedView('machines')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'machines'
              ? 'bg-[#286BD4] text-white'
              : 'bg-white text-[#286BD4] hover:bg-[#f0f5ff]'
          }`}
        >
          État des Machines
        </button>
      </div>

      {/* Contenu principal */}
      {selectedView === 'calls' ? (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#286BD4] mb-4">
              Répartition des Appels
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique circulaire */}
              <div className="bg-[#f0f5ff] rounded-2xl p-6">
                <h3 className="text-lg font-medium text-[#286BD4] mb-4">
                  Types d'appels
                </h3>
                {/* Intégrer ici un composant de graphique */}
              </div>
              {/* Statistiques détaillées */}
              <div className="bg-[#f0f5ff] rounded-2xl p-6">
                <h3 className="text-lg font-medium text-[#286BD4] mb-4">
                  Top problèmes signalés
                </h3>
                {/* Liste des problèmes fréquents */}
              </div>
            </div>
          </div>

          {/* Tableau des appels */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f5ff]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Laverie</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Machine</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {callsData.map((call) => (
                  <React.Fragment key={call.id}>
                    <tr 
                      className="border-b border-[#f0f5ff] hover:bg-[#f0f5ff]/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === call.id ? null : call.id)}
                    >
                      <td className="px-4 py-3 text-sm text-[#286BD4]">{call.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          call.type === 'information' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {call.type === 'information' ? 'Information' : 'Problème'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#286BD4]">{call.laundryName}</td>
                      <td className="px-4 py-3 text-sm text-[#286BD4]">{call.machineNumber || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(call.status)}`} />
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-[#286BD4] hover:text-[#286BD4]/80">
                          <ChevronDown className={`w-5 h-5 transition-transform ${
                            expandedRow === call.id ? 'transform rotate-180' : ''
                          }`} />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === call.id && (
                      <tr className="bg-[#f0f5ff]/30">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-3">
                            <p className="text-sm text-[#286BD4]">
                              <span className="font-medium">Description:</span> {call.description}
                            </p>
                            {call.frequency && (
                              <p className="text-sm text-[#286BD4]">
                                <span className="font-medium">Fréquence:</span> Signalé {call.frequency} fois cette semaine
                              </p>
                            )}
                            <div className="flex gap-4 mt-2">
                              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#286BD4] text-white text-sm hover:bg-[#286BD4]/90 transition-colors">
                                <Wrench className="w-4 h-4" />
                                Planifier maintenance
                              </button>
                              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-[#286BD4] text-sm hover:bg-[#f0f5ff] transition-colors">
                                <RefreshCcw className="w-4 h-4" />
                                Mettre à jour statut
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#286BD4] mb-4">
              État des Machines
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique d'utilisation */}
              <div className="bg-[#f0f5ff] rounded-2xl p-6">
                <h3 className="text-lg font-medium text-[#286BD4] mb-4">
                  Utilisation par laverie
                </h3>
                {/* Intégrer ici un composant de graphique */}
              </div>
              {/* Recommandations */}
              <div className="bg-[#f0f5ff] rounded-2xl p-6">
                <h3 className="text-lg font-medium text-[#286BD4] mb-4">
                  Recommandations IA
                </h3>
                <div className="space-y-4">
                  {machinesData
                    .filter((machine) => machine.usage === 'high')
                    .map((machine) => (
                      <div key={machine.id} className="flex items-start gap-3 p-3 bg-white rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#286BD4]">
                            {machine.laundryName} - Machine #{machine.machineNumber}
                          </p>
                          <p className="text-sm text-[#286BD4]/60 mt-1">
                            {machine.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des machines */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f5ff]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Laverie</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Machine</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Usage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Problèmes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Dernière maintenance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#286BD4]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {machinesData.map((machine) => (
                  <tr 
                    key={machine.id}
                    className="border-b border-[#f0f5ff] hover:bg-[#f0f5ff]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-[#286BD4]">{machine.laundryName}</td>
                    <td className="px-4 py-3 text-sm text-[#286BD4]">#{machine.machineNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block w-2 h-2 rounded-full ${getUsageColor(machine.usage)}`} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#286BD4]">{machine.problemsCount}</td>
                    <td className="px-4 py-3 text-sm text-[#286BD4]">{machine.lastMaintenance}</td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f0f5ff] text-[#286BD4] text-sm hover:bg-[#286BD4] hover:text-white transition-colors">
                        Voir détails
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
