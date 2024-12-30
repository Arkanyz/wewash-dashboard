import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Clock, CheckCircle2, PhoneCall, Activity, Phone } from 'lucide-react';
import Modal from '../ui/Modal';

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  onClick: () => void;
}

const WeLineWidget: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Données mockées
  const mockData = {
    history: [
      { date: '2023-12-25', count: 45, resolved: 42 },
      { date: '2023-12-24', count: 38, resolved: 35 },
      { date: '2023-12-23', count: 41, resolved: 38 }
    ],
    byLocation: [
      { name: 'Paris Centre', rate: 95 },
      { name: 'Lyon', rate: 88 },
      { name: 'Marseille', rate: 91 }
    ],
    byType: [
      { type: 'Panne système', time: '1h 45min' },
      { type: 'Problème mécanique', time: '2h 30min' },
      { type: 'Maintenance', time: '1h 30min' }
    ],
    byStatus: [
      { status: 'Actif', count: 245 },
      { status: 'En maintenance', count: 25 },
      { status: 'Hors service', count: 10 }
    ],
    total: 280
  };
  
  const stats = [
    {
      label: 'Appels VAPI (24h)',
      value: '156',
      trend: { value: 12, isPositive: true },
      icon: <PhoneCall className="w-4 h-4 text-blue-500" />,
      onClick: () => setActiveModal('calls')
    },
    {
      label: 'Taux de résolution',
      value: '92%',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      onClick: () => setActiveModal('resolution')
    },
    {
      label: 'Temps moyen',
      value: '2h 15min',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      onClick: () => setActiveModal('time')
    },
    {
      label: 'Machines actives',
      value: '245/280',
      icon: <Activity className="w-4 h-4 text-purple-500" />,
      onClick: () => setActiveModal('machines')
    }
  ];

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="flex justify-between items-center mb-3">
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">En ligne</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={stat.onClick}
              className="p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-gray-400">{stat.label}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-white">{stat.value}</span>
                    {stat.trend && (
                      <span className={
                        stat.trend.isPositive ? 'text-green-500 text-xs' : 'text-red-500 text-xs'
                      }>
                        {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  {stat.icon}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={activeModal === 'calls'}
        onClose={() => setActiveModal(null)}
        title="Historique des appels VAPI"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white">Dernières 72 heures</h4>
          </div>
          <div className="space-y-4">
            {mockData.history.map((day, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{day.date}</p>
                  <p className="text-sm text-gray-500">Résolution: {Math.round((day.resolved / day.count) * 100)}%</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{day.count} appels</p>
                  <p className="text-sm text-green-500">{day.resolved} résolus</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'resolution'}
        onClose={() => setActiveModal(null)}
        title="Taux de résolution par laverie"
      >
        <div className="space-y-4">
          {mockData.byLocation.map((location, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{location.name}</p>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${location.rate}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{location.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'time'}
        onClose={() => setActiveModal(null)}
        title="Analyse des délais par type de problème"
      >
        <div className="space-y-4">
          {mockData.byType.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.type}</p>
                <p className="text-sm text-gray-500">Temps moyen de résolution</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white">{item.time}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'machines'}
        onClose={() => setActiveModal(null)}
        title="État des machines"
      >
        <div className="space-y-4">
          {mockData.byStatus.map((status, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{status.status}</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {status.count} machines
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((status.count / mockData.total) * 100)}%)
                </span>
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default WeLineWidget;
