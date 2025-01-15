import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Settings, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { statisticsService, type LaundryWithMachines, type MachineStatus } from '../../../services/statisticsService';

interface MachinesStatusProps {
  selectedMetric: string | null;
}

const MachinesStatus: React.FC<MachinesStatusProps> = ({ selectedMetric }) => {
  const [selectedLaundry, setSelectedLaundry] = useState<LaundryWithMachines | null>(null);
  const [laundries, setLaundries] = useState<LaundryWithMachines[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMetric === 'critical') {
      // Filtrer pour montrer uniquement les machines avec des incidents prioritaires
    }
  }, [selectedMetric]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await statisticsService.getLaundriesWithMachines();
      setLaundries(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MachineStatus['status']) => {
    switch (status) {
      case 'ok':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status: MachineStatus['status']) => {
    switch (status) {
      case 'ok':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#286BD4]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Chargement des données...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-[#286BD4] text-white rounded-lg hover:bg-[#286BD4]/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalMachines = laundries.reduce((acc, l) => acc + l.machines.length, 0);
  const okMachines = laundries.reduce((acc, l) => acc + l.machines.filter(m => m.status === 'ok').length, 0);
  const warningMachines = laundries.reduce((acc, l) => acc + l.machines.filter(m => m.status === 'warning').length, 0);
  const errorMachines = laundries.reduce((acc, l) => acc + l.machines.filter(m => m.status === 'error').length, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Résumé des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Activity className="text-[#286BD4]" />
            <h3 className="text-sm font-medium text-gray-700">Total Machines</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-[#1a1a1a]">{totalMachines}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" />
            <h3 className="text-sm font-medium text-gray-700">En État</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-[#1a1a1a]">{okMachines}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-yellow-500" />
            <h3 className="text-sm font-medium text-gray-700">Avertissements</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-[#1a1a1a]">{warningMachines}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Settings className="text-red-500" />
            <h3 className="text-sm font-medium text-gray-700">Problèmes</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-[#1a1a1a]">{errorMachines}</p>
        </div>
      </div>

      {/* Liste des laveries et machines */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-[#1a1a1a]">État des Machines par Laverie</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {laundries.map((laundry) => (
            <div key={laundry.id} className="p-4">
              <button
                onClick={() => setSelectedLaundry(selectedLaundry?.id === laundry.id ? null : laundry)}
                className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#286BD4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#286BD4]" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-[#1a1a1a]">{laundry.name}</h4>
                    <p className="text-sm text-gray-500">{laundry.address}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-green-500">{laundry.machines.filter(m => m.status === 'ok').length} OK</span>
                      <span className="text-xs text-yellow-500">{laundry.machines.filter(m => m.status === 'warning').length} Avertissements</span>
                      <span className="text-xs text-red-500">{laundry.machines.filter(m => m.status === 'error').length} Problèmes</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                  selectedLaundry?.id === laundry.id ? 'rotate-90' : ''
                }`} />
              </button>

              {selectedLaundry?.id === laundry.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pl-12"
                >
                  <div className="space-y-3">
                    {laundry.machines.map((machine) => (
                      <div
                        key={machine.id}
                        className={`p-3 rounded-lg ${getStatusBg(machine.status)} flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status)} ring-2 ring-offset-2 ${getStatusColor(machine.status)}/30`} />
                          <span className="font-medium text-[#1a1a1a]">{machine.name}</span>
                        </div>
                        {machine.lastReport && (
                          <span className="text-sm text-gray-500">{machine.lastReport}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MachinesStatus;
