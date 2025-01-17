import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Settings, Calendar, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LaundryMachinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  laundryId: string;
  ownerId: string;
}

type Machine = {
  id: string;
  number: string;
  type: string;
  status: 'ok' | 'maintenance' | 'out_of_order';
  lastUsed: string;
};

type Technician = {
  id: string;
  name: string;
  phone: string;
  email: string;
  speciality: string;
};

const EQUIPMENT_TYPES = {
  washer: 'Lave-linge',
  dryer: 'Sèche-linge',
  payment_terminal: 'Terminal de paiement',
};

const STATUS_STYLES = {
  ok: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  maintenance: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  out_of_order: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
};

const LaundryMachinesModal: React.FC<LaundryMachinesModalProps> = ({
  isOpen,
  onClose,
  laundryId,
  ownerId,
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMachines();
      fetchTechnicians();
    }
  }, [isOpen, laundryId]);

  const fetchMachines = async () => {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('laundry_id', laundryId)
      .order('type')
      .order('number');

    if (!error && data) {
      setMachines(data);
    }
    setLoading(false);
  };

  const fetchTechnicians = async () => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('owner_id', ownerId);

    if (!error && data) {
      setTechnicians(data);
    }
  };

  const handleMaintenanceClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowMaintenanceModal(true);
  };

  const handleDeleteMachine = async (machineId: string) => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette machine ?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('id', machineId);

    if (!error) {
      setMachines(machines.filter(m => m.id !== machineId));
    }
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || machine.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* En-tête */}
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Gestion des machines
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Filtres et recherche */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une machine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#286BD4]/20 focus:border-[#286BD4]"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#286BD4]/20 focus:border-[#286BD4]"
                >
                  <option value="all">Tous les types</option>
                  {Object.entries(EQUIPMENT_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tableau des machines */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-4 text-left text-sm font-medium text-gray-500">ID Machine</th>
                      <th className="pb-4 text-left text-sm font-medium text-gray-500">Type</th>
                      <th className="pb-4 text-left text-sm font-medium text-gray-500">Statut</th>
                      <th className="pb-4 text-left text-sm font-medium text-gray-500">Dernière utilisation</th>
                      <th className="pb-4 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMachines.map((machine) => (
                      <tr key={machine.id} className="group hover:bg-gray-50">
                        <td className="py-4">
                          <span className="font-medium text-gray-900">#{machine.number}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-600">
                            {EQUIPMENT_TYPES[machine.type as keyof typeof EQUIPMENT_TYPES]}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${STATUS_STYLES[machine.status].color} ${STATUS_STYLES[machine.status].bg} ${STATUS_STYLES[machine.status].border}`}>
                            {machine.status === 'ok' && 'OK'}
                            {machine.status === 'maintenance' && 'Maintenance prévue'}
                            {machine.status === 'out_of_order' && 'Hors service'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-600">
                            {formatDistanceToNow(new Date(machine.lastUsed), { 
                              addSuffix: true,
                              locale: fr 
                            })}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {/* TODO: Implement edit */}}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleMaintenanceClick(machine)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Planifier une maintenance"
                            >
                              <Calendar className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMachine(machine.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredMachines.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    Aucune machine ne correspond à votre recherche
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Modal de maintenance */}
          {showMaintenanceModal && selectedMachine && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Planifier une maintenance
                  </h3>
                  <button
                    onClick={() => setShowMaintenanceModal(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Machine #{selectedMachine.number}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {EQUIPMENT_TYPES[selectedMachine.type as keyof typeof EQUIPMENT_TYPES]}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">
                      Techniciens disponibles
                    </h4>
                    <div className="space-y-3">
                      {technicians.map((tech) => (
                        <div
                          key={tech.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#286BD4] hover:bg-[#286BD4]/5 cursor-pointer transition-colors"
                        >
                          <div>
                            <h5 className="font-medium text-gray-900">{tech.name}</h5>
                            <p className="text-sm text-gray-500">{tech.speciality}</p>
                          </div>
                          <div className="flex gap-3">
                            <a
                              href={`tel:${tech.phone}`}
                              className="text-[#286BD4] hover:text-[#286BD4]/80 text-sm font-medium"
                            >
                              Appeler
                            </a>
                            <a
                              href={`mailto:${tech.email}`}
                              className="text-[#286BD4] hover:text-[#286BD4]/80 text-sm font-medium"
                            >
                              Email
                            </a>
                          </div>
                        </div>
                      ))}

                      {technicians.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          Aucun technicien disponible
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LaundryMachinesModal;
