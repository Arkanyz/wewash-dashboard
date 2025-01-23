import React, { useState } from 'react';
import { Plus, Trash2, WashingMachine, Loader2, CreditCard } from 'lucide-react';

interface Machine {
  id: string;
  type: 'washer' | 'dryer' | 'payment';
  brand?: string;
  capacity?: number;
  quantity: number;
}

interface MachinesStepProps {
  formData: {
    machines: Machine[];
  };
  onChange: (data: any) => void;
}

const CAPACITIES = [6, 8, 10, 12, 14, 18];

export const MachinesStep: React.FC<MachinesStepProps> = ({ formData, onChange }) => {
  const [newMachine, setNewMachine] = useState<Partial<Machine>>({
    type: 'washer',
    quantity: 1
  });

  const handleAddMachine = () => {
    if (!newMachine.type) return;

    const machine: Machine = {
      id: Math.random().toString(36).substr(2, 9),
      type: newMachine.type,
      brand: newMachine.brand,
      capacity: newMachine.capacity,
      quantity: newMachine.quantity || 1
    };

    onChange({
      ...formData,
      machines: [...formData.machines, machine]
    });

    setNewMachine({
      type: 'washer',
      quantity: 1
    });
  };

  const handleRemoveMachine = (id: string) => {
    onChange({
      ...formData,
      machines: formData.machines.filter(m => m.id !== id)
    });
  };

  const getMachineIcon = (type: string) => {
    switch (type) {
      case 'washer':
        return WashingMachine;
      case 'dryer':
        return Loader2;
      case 'payment':
        return CreditCard;
      default:
        return WashingMachine;
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulaire d'ajout */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Ajouter des machines</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de machine
            </label>
            <select
              value={newMachine.type}
              onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value as any })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10"
            >
              <option value="washer">Lave-linge</option>
              <option value="dryer">Sèche-linge</option>
              <option value="payment">Borne de paiement</option>
            </select>
          </div>

          {newMachine.type !== 'payment' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité
              </label>
              <select
                value={newMachine.capacity}
                onChange={(e) => setNewMachine({ ...newMachine, capacity: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10"
              >
                <option value="">Sélectionner</option>
                {CAPACITIES.map(cap => (
                  <option key={cap} value={cap}>{cap}kg</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque (optionnel)
            </label>
            <input
              type="text"
              value={newMachine.brand || ''}
              onChange={(e) => setNewMachine({ ...newMachine, brand: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10"
              placeholder="ex: Miele, Electrolux..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              value={newMachine.quantity || 1}
              onChange={(e) => setNewMachine({ ...newMachine, quantity: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddMachine}
            className="inline-flex items-center px-3 py-2 bg-[#286BD4] text-white rounded-lg text-sm font-medium hover:bg-[#286BD4]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des machines */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Machines ajoutées</h3>
        
        <div className="divide-y divide-gray-100">
          {formData.machines.map((machine) => {
            const Icon = getMachineIcon(machine.type);
            return (
              <div key={machine.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-[#286BD4]" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {machine.type === 'washer' && 'Lave-linge'}
                      {machine.type === 'dryer' && 'Sèche-linge'}
                      {machine.type === 'payment' && 'Borne de paiement'}
                      {machine.capacity && ` ${machine.capacity}kg`}
                      {machine.quantity > 1 && ` (x${machine.quantity})`}
                    </p>
                    {machine.brand && (
                      <p className="text-sm text-gray-500">{machine.brand}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMachine(machine.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {formData.machines.length === 0 && (
            <p className="py-4 text-sm text-gray-500 text-center">
              Aucune machine ajoutée
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
