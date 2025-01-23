import React, { useState } from 'react';
import { Plus, WashingMachine } from 'lucide-react';

// Fonction pour générer un UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface MachineType {
  id: string;
  name: string;
  icon: string;
}

const MACHINE_TYPES: MachineType[] = [
  { id: 'washer', name: 'Lave-linge', icon: '⚡' },
  { id: 'dryer', name: 'Sèche-linge', icon: '🌪️' },
  { id: 'terminal', name: 'Terminal de paiement', icon: '💳' }
];

const MACHINE_BRANDS = [
  'Miele',
  'Electrolux',
  'LG',
  'Samsung',
  'Speed Queen',
  'Primus',
  'Alliance',
  'Autre'
];

interface Machine {
  id: string;
  type: string;
  brand: string;
  capacity: string;
  quantity: number;
}

interface MachinesStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const DEFAULT_WASHING_PROGRAMS = [
  { name: 'Froid', duration: 30, price: 0 },
  { name: 'Normal 30°', duration: 35, price: 0 },
  { name: 'Normal 40°', duration: 45, price: 0 },
  { name: 'Normal 60°', duration: 60, price: 0 },
  { name: 'Intensif 40°', duration: 75, price: 0 },
  { name: 'Intensif 60°', duration: 90, price: 0 }
];

const DEFAULT_DRYING_PROGRAMS = [
  { name: '15 minutes', duration: 15, price: 0 },
  { name: '30 minutes', duration: 30, price: 0 },
  { name: '45 minutes', duration: 45, price: 0 },
  { name: '60 minutes', duration: 60, price: 0 }
];

const getDefaultPrograms = (type: string) => {
  switch (type) {
    case 'washer':
      return DEFAULT_WASHING_PROGRAMS;
    case 'dryer':
      return DEFAULT_DRYING_PROGRAMS;
    default:
      return [{ name: 'Standard', duration: 30, price: 0 }];
  }
};

const MachinesStep: React.FC<MachinesStepProps> = ({ formData, setFormData }) => {
  const [newMachine, setNewMachine] = useState<Machine>({
    id: '',
    type: '',
    brand: '',
    capacity: '',
    quantity: 1
  });

  const handleAddMachine = () => {
    if (!newMachine.type || !newMachine.brand || !newMachine.capacity) return;

    const machineId = uuidv4();
    
    // Initialiser les tarifs pour la nouvelle machine avec les programmes par défaut
    const defaultPrograms = getDefaultPrograms(newMachine.type);
    const updatedPricing = {
      ...formData.pricing,
      rates: {
        ...formData.pricing?.rates,
        [machineId]: {
          programs: formData.pricing?.simple ? [defaultPrograms[0]] : defaultPrograms
        }
      }
    };

    setFormData({
      ...formData,
      machines: [
        ...(formData.machines || []),
        { ...newMachine, id: machineId }
      ],
      pricing: updatedPricing
    });

    setNewMachine({
      id: '',
      type: '',
      brand: '',
      capacity: '',
      quantity: 1
    });
  };

  const handleRemoveMachine = (machineId: string) => {
    setFormData({
      ...formData,
      machines: formData.machines.filter((m: Machine) => m.id !== machineId)
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-2 text-blue-500">
        <WashingMachine className="w-5 h-5" />
        <h3 className="text-base sm:text-lg font-medium">Équipements</h3>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Ajouter une machine</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Type de machine */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Type
            </label>
            <select
              value={newMachine.type}
              onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl border border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
            >
              <option value="">Sélectionner</option>
              {MACHINE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Marque */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Marque
            </label>
            <select
              value={newMachine.brand}
              onChange={(e) => setNewMachine({ ...newMachine, brand: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl border border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
            >
              <option value="">Sélectionner</option>
              {MACHINE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Capacité */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Capacité
            </label>
            <select
              value={newMachine.capacity}
              onChange={(e) => setNewMachine({ ...newMachine, capacity: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl border border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
            >
              <option value="">Sélectionner</option>
              {['6kg', '8kg', '10kg', '12kg', '14kg', '18kg'].map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              value={newMachine.quantity}
              onChange={(e) => setNewMachine({ ...newMachine, quantity: parseInt(e.target.value) })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl border border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddMachine}
            disabled={!newMachine.type || !newMachine.brand || !newMachine.capacity}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm sm:text-base rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des machines */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Machines ajoutées</h4>
        <div className="grid grid-cols-1 gap-3">
          {formData.machines?.map((machine: Machine) => {
            const typeInfo = MACHINE_TYPES.find(t => t.id === machine.type);
            return (
              <div
                key={machine.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-100 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-xl sm:text-2xl">{typeInfo?.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">
                      {typeInfo?.name} {machine.capacity}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {machine.brand} • {machine.quantity} unité{machine.quantity > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMachine(machine.id)}
                  className="p-1.5 sm:p-2 rounded-xl text-red-500 bg-red-50/50 border border-red-100
                    hover:bg-red-100/80 hover:border-red-200 transition-all duration-200"
                  title="Supprimer"
                >
                  <svg 
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            );
          })}
          {(!formData.machines || formData.machines.length === 0) && (
            <div className="text-center py-6 sm:py-8 text-sm text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              Aucune machine ajoutée
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachinesStep;
