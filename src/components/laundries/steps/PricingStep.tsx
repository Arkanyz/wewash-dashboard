import React, { useState } from 'react';
import { Euro, WashingMachine, Loader2, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';

interface PricingStepProps {
  formData: {
    machines: any[];
    pricing: {
      simple: boolean;
      rates: {
        [key: string]: {
          programs: Array<{
            name: string;
            duration: number;
            price: number;
          }>;
        };
      };
    };
  };
  onChange: (data: any) => void;
}

const DEFAULT_WASHING_PROGRAMS = [
  { name: 'Froid', duration: 30 },
  { name: 'Normal 30°', duration: 35 },
  { name: 'Normal 40°', duration: 45 },
  { name: 'Intensif 60°', duration: 60 },
  { name: 'Délicat', duration: 40 }
];

const DEFAULT_DRYING_DURATIONS = [
  { duration: 10, price: 1 },
  { duration: 15, price: 1.5 },
  { duration: 20, price: 2 }
];

const DEFAULT_ADDITIONAL_SERVICES = [
  { name: 'Lessive', price: 1 },
  { name: 'Assouplissant', price: 1 },
  { name: 'Désinfectant', price: 1.5 }
];

export const PricingStep: React.FC<PricingStepProps> = ({ formData, onChange }) => {
  const [pricingMode, setPricingMode] = useState<'simple' | 'advanced'>('simple');

  const handleProgramPriceChange = (machineId: string, programIndex: number, price: number) => {
    const newPricing = { ...formData.pricing };
    newPricing.rates[machineId].programs[programIndex].price = price;
    onChange({
      ...formData,
      pricing: newPricing
    });
  };

  return (
    <div className="space-y-8">
      {/* Choix du mode de tarification */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Mode de tarification</h3>
          <p className="text-sm text-gray-500">
            Choisissez entre une tarification simple ou avancée
          </p>
        </div>
        <Switch
          checked={pricingMode === 'advanced'}
          onCheckedChange={(checked) => setPricingMode(checked ? 'advanced' : 'simple')}
        />
      </div>

      {/* Tarification simple */}
      {pricingMode === 'simple' && (
        <div className="space-y-6">
          {/* Machines à laver */}
          {formData.machines
            .filter(m => m.type === 'washer')
            .map(machine => (
              <div key={machine.id} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <WashingMachine className="w-4 h-4 text-[#286BD4]" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Lave-linge {machine.capacity}kg
                    {machine.quantity > 1 && ` (x${machine.quantity})`}
                  </h4>
                </div>
                <div className="ml-6">
                  <div className="relative w-48">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.pricing.rates[machine.id]?.programs[0]?.price || ''}
                      onChange={(e) => handleProgramPriceChange(machine.id, 0, Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 text-sm"
                      placeholder="Prix par cycle"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                  </div>
                </div>
              </div>
            ))}

          {/* Séchoirs */}
          {formData.machines
            .filter(m => m.type === 'dryer')
            .map(machine => (
              <div key={machine.id} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-[#286BD4]" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Sèche-linge
                    {machine.quantity > 1 && ` (x${machine.quantity})`}
                  </h4>
                </div>
                <div className="ml-6">
                  <div className="relative w-48">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.pricing.rates[machine.id]?.programs[0]?.price || ''}
                      onChange={(e) => handleProgramPriceChange(machine.id, 0, Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 text-sm"
                      placeholder="Prix pour 10 minutes"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tarification avancée */}
      {pricingMode === 'advanced' && (
        <div className="space-y-8">
          {/* Machines à laver */}
          {formData.machines
            .filter(m => m.type === 'washer')
            .map(machine => (
              <div key={machine.id} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <WashingMachine className="w-4 h-4 text-[#286BD4]" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Lave-linge {machine.capacity}kg
                    {machine.quantity > 1 && ` (x${machine.quantity})`}
                  </h4>
                </div>
                <div className="ml-6 space-y-3">
                  {DEFAULT_WASHING_PROGRAMS.map((program, index) => (
                    <div key={program.name} className="flex items-center space-x-4">
                      <div className="w-32">
                        <p className="text-sm text-gray-900">{program.name}</p>
                        <p className="text-xs text-gray-500">{program.duration} min</p>
                      </div>
                      <div className="relative w-32">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.pricing.rates[machine.id]?.programs[index]?.price || ''}
                          onChange={(e) => handleProgramPriceChange(machine.id, index, Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Séchoirs */}
          {formData.machines
            .filter(m => m.type === 'dryer')
            .map(machine => (
              <div key={machine.id} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-[#286BD4]" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Sèche-linge
                    {machine.quantity > 1 && ` (x${machine.quantity})`}
                  </h4>
                </div>
                <div className="ml-6 space-y-3">
                  {DEFAULT_DRYING_DURATIONS.map((duration, index) => (
                    <div key={duration.duration} className="flex items-center space-x-4">
                      <div className="w-32">
                        <p className="text-sm text-gray-900">{duration.duration} minutes</p>
                      </div>
                      <div className="relative w-32">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.pricing.rates[machine.id]?.programs[index]?.price || duration.price}
                          onChange={(e) => handleProgramPriceChange(machine.id, index, Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Services additionnels */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Plus className="w-4 h-4 text-[#286BD4]" />
          <h4 className="text-sm font-medium text-gray-900">Services additionnels</h4>
        </div>
        <div className="ml-6 space-y-3">
          {DEFAULT_ADDITIONAL_SERVICES.map((service, index) => (
            <div key={service.name} className="flex items-center space-x-4">
              <div className="w-32">
                <p className="text-sm text-gray-900">{service.name}</p>
              </div>
              <div className="relative w-32">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={service.price}
                  onChange={(e) => {
                    const newServices = [...DEFAULT_ADDITIONAL_SERVICES];
                    newServices[index].price = Number(e.target.value);
                    // Mettre à jour le state
                  }}
                  className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
