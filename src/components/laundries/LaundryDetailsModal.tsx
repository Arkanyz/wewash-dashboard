import React from 'react';
import { X, AlertCircle, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MaintenanceAlerts from '../maintenance/MaintenanceAlerts';
import MachineHealth from '../maintenance/MachineHealth';

interface LaundryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  laundry: {
    id: string;
    name: string;
    address: string;
    city: string;
    postal_code: string;
    phone: string;
    machines: Array<{
      id: string;
      number: string;
      type: string;
      status: 'available' | 'out_of_order';
    }>;
  };
}

const EQUIPMENT_TYPES = {
  washer: 'Lave-linge',
  dryer: 'Sèche-linge',
  payment_terminal: 'Terminal de paiement',
  change_machine: 'Monnayeur',
  vending_machine: 'Distributeur',
  water_fountain: 'Fontaine à eau',
  other: 'Autre équipement'
};

const LaundryDetailsModal: React.FC<LaundryDetailsModalProps> = ({
  isOpen,
  onClose,
  laundry,
}) => {
  const groupedMachines = laundry.machines.reduce((acc, machine) => {
    if (!acc[machine.type]) {
      acc[machine.type] = [];
    }
    acc[machine.type].push(machine);
    return acc;
  }, {} as Record<string, typeof laundry.machines>);

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
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* En-tête avec fond dégradé - Fixe */}
            <div className="bg-gradient-to-r from-[#286BD4] to-[#1E5BB7] px-8 py-8 text-white rounded-t-3xl">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {laundry.name}
                  </h2>
                  <div className="space-y-2 text-white/90">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{laundry.address}, {laundry.postal_code} {laundry.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{laundry.phone}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Stats en overlay - Fixe */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <div className="text-4xl font-bold mb-2">{laundry.machines.length}</div>
                  <div className="text-sm text-white/90">Équipements total</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <div className="text-4xl font-bold mb-2">
                    {laundry.machines.filter(m => m.status === 'available').length}
                  </div>
                  <div className="text-sm text-white/90">Disponibles</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <div className="text-4xl font-bold mb-2">
                    {laundry.machines.filter(m => m.status === 'out_of_order').length}
                  </div>
                  <div className="text-sm text-white/90">Hors service</div>
                </div>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto modern-scrollbar">
              <div className="p-8">
                {/* Alertes de maintenance */}
                <div className="mb-10">
                  <MaintenanceAlerts laundryId={laundry.id} />
                </div>

                <div className="space-y-10">
                  {Object.entries(groupedMachines).map(([type, machines]) => (
                    <div key={type} className="bg-white rounded-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 bg-[#286BD4] rounded-full"></div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {EQUIPMENT_TYPES[type as keyof typeof EQUIPMENT_TYPES]}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {machines.length} équipement{machines.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {machines.map((machine) => (
                          <motion.div
                            key={machine.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group relative p-6 rounded-2xl transition-all hover:shadow-lg ${
                              machine.status === 'available'
                                ? 'bg-gradient-to-br from-emerald-50 to-white border border-emerald-100'
                                : 'bg-gradient-to-br from-red-50 to-white border border-red-100'
                            }`}
                          >
                            <div className="absolute top-4 right-4">
                              {machine.status === 'available' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="space-y-3">
                              <div className="text-2xl font-bold text-gray-900">
                                #{machine.number}
                              </div>
                              <div className={`text-sm font-medium ${
                                machine.status === 'available' 
                                  ? 'text-emerald-600' 
                                  : 'text-red-600'
                              }`}>
                                {machine.status === 'available' ? 'Disponible' : 'Hors service'}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LaundryDetailsModal;
