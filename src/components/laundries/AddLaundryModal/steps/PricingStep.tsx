import React, { useState, useCallback } from 'react';
import { Euro, WashingMachine, Loader2, Plus, Trash2, Upload, AlertTriangle, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
      skipped?: boolean;
    };
  };
  onChange: (data: any) => void;
}

const DEFAULT_WASHING_PROGRAMS = [
  { name: 'Froid', duration: 30 },
  { name: 'Normal 30°', duration: 35 },
  { name: 'Normal 40°', duration: 45 },
  { name: 'Normal 60°', duration: 60 },
  { name: 'Intensif 40°', duration: 75 },
  { name: 'Intensif 60°', duration: 90 }
];

const DEFAULT_DRYING_PROGRAMS = [
  { name: '15 minutes', duration: 15 },
  { name: '30 minutes', duration: 30 },
  { name: '45 minutes', duration: 45 },
  { name: '60 minutes', duration: 60 }
];

const PricingStep: React.FC<PricingStepProps> = ({ formData, onChange }) => {
  const [newProgram, setNewProgram] = useState({
    name: '',
    duration: 0,
    price: 0
  });

  const [skipPricing, setSkipPricing] = useState(formData.pricing.skipped || false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimpleModeChange = (checked: boolean) => {
    // Mise à jour du mode de tarification
    const newPricing = {
      ...formData.pricing,
      simple: checked,
      rates: { ...formData.pricing.rates }
    };

    // Pour chaque machine, on ajuste les programmes selon le mode
    formData.machines.forEach((machine) => {
      if (checked) {
        // Mode simple : on garde uniquement le premier programme
        const firstProgram = formData.pricing.rates[machine.id]?.programs?.[0] || {
          name: machine.type === 'washer' ? 'Standard' : '30 minutes',
          duration: machine.type === 'washer' ? 45 : 30,
          price: 0
        };
        newPricing.rates[machine.id] = {
          programs: [firstProgram]
        };
      } else {
        // Mode avancé : on restaure les programmes par défaut
        const defaultPrograms = machine.type === 'washer'
          ? [
              { name: 'Froid', duration: 30, price: 0 },
              { name: 'Normal 30°', duration: 35, price: 0 },
              { name: 'Normal 40°', duration: 45, price: 0 },
              { name: 'Normal 60°', duration: 60, price: 0 },
              { name: 'Intensif 40°', duration: 75, price: 0 },
              { name: 'Intensif 60°', duration: 90, price: 0 }
            ]
          : [
              { name: '15 minutes', duration: 15, price: 0 },
              { name: '30 minutes', duration: 30, price: 0 },
              { name: '45 minutes', duration: 45, price: 0 },
              { name: '60 minutes', duration: 60, price: 0 }
            ];
        
        // On conserve les prix existants si possible
        const existingPrograms = formData.pricing.rates[machine.id]?.programs || [];
        const mergedPrograms = defaultPrograms.map((program, index) => ({
          ...program,
          price: existingPrograms[index]?.price || 0
        }));

        newPricing.rates[machine.id] = {
          programs: mergedPrograms
        };
      }
    });

    onChange({
      ...formData,
      pricing: newPricing
    });
  };

  const handleProgramChange = (machineId: string, index: number, field: string, value: any) => {
    const currentPrograms = formData.pricing.rates[machineId]?.programs || [];
    const updatedPrograms = [...currentPrograms];
    
    if (!updatedPrograms[index]) {
      updatedPrograms[index] = { name: '', duration: 0, price: 0 };
    }
    
    updatedPrograms[index] = {
      ...updatedPrograms[index],
      [field]: value
    };

    const updatedRates = {
      ...formData.pricing.rates,
      [machineId]: {
        ...formData.pricing.rates[machineId],
        programs: updatedPrograms
      }
    };

    onChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        rates: updatedRates
      }
    });
  };

  const handleAddProgram = (machineId: string) => {
    if (!newProgram.name) return;

    const currentPrograms = formData.pricing.rates[machineId]?.programs || [];
    const updatedPrograms = [...currentPrograms, { ...newProgram }];

    const updatedRates = {
      ...formData.pricing.rates,
      [machineId]: {
        ...formData.pricing.rates[machineId],
        programs: updatedPrograms
      }
    };

    onChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        rates: updatedRates
      }
    });

    setNewProgram({
      name: '',
      duration: 0,
      price: 0
    });
  };

  const handleRemoveProgram = (machineId: string, index: number) => {
    const currentPrograms = formData.pricing.rates[machineId]?.programs || [];
    const updatedPrograms = currentPrograms.filter((_, i) => i !== index);

    const updatedRates = {
      ...formData.pricing.rates,
      [machineId]: {
        ...formData.pricing.rates[machineId],
        programs: updatedPrograms
      }
    };

    onChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        rates: updatedRates
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      toast({
        title: "Import de fichiers",
        description: "Cette fonctionnalité sera bientôt disponible",
      });
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du fichier",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialiser les tarifs pour une nouvelle machine si nécessaire
  const getMachinePricing = (machineId: string) => {
    if (!formData.pricing.rates[machineId]) {
      const defaultPrograms = formData.pricing.simple 
        ? [{ name: 'Standard', duration: 30, price: 0 }]
        : (formData.machines.find(m => m.id === machineId)?.type === 'washer' 
            ? DEFAULT_WASHING_PROGRAMS 
            : DEFAULT_DRYING_PROGRAMS).map(prog => ({ ...prog, price: 0 }));

      const updatedRates = {
        ...formData.pricing.rates,
        [machineId]: {
          programs: defaultPrograms
        }
      };

      onChange({
        ...formData,
        pricing: {
          ...formData.pricing,
          rates: updatedRates
        }
      });

      return { programs: defaultPrograms };
    }
    return formData.pricing.rates[machineId];
  };

  const getMachineTypeName = (type: string) => {
    switch (type) {
      case 'washer':
        return 'Lave-linge';
      case 'dryer':
        return 'Sèche-linge';
      default:
        return 'Machine';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-2 text-blue-500">
        <Euro className="w-5 h-5" />
        <h3 className="text-base sm:text-lg font-medium">Tarification</h3>
      </div>

      {/* Alerte d'information */}
      <div className={`p-4 rounded-xl ${skipPricing ? 'bg-yellow-50' : 'bg-blue-50'}`}>
        <div className="flex gap-3">
          {skipPricing ? (
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
          )}
          <div className="text-sm">
            <p className={skipPricing ? 'text-yellow-800' : 'text-blue-800'}>
              {skipPricing 
                ? "Sans les informations de tarification, notre assistant vocal ne pourra pas répondre aux questions concernant les prix."
                : "Remplissez les tarifs pour permettre à notre assistant vocal de répondre aux questions sur les prix."}
            </p>
          </div>
        </div>
      </div>

      {/* Option pour ignorer la tarification */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="skipPricing"
          checked={skipPricing}
          onChange={(e) => {
            setSkipPricing(e.target.checked);
            if (e.target.checked) {
              onChange({
                ...formData,
                pricing: {
                  ...formData.pricing,
                  skipped: true,
                  rates: {}
                }
              });
            } else {
              onChange({
                ...formData,
                pricing: {
                  ...formData.pricing,
                  skipped: false
                }
              });
            }
          }}
          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="skipPricing" className="text-sm text-gray-700">
          Je remplirai les tarifs plus tard
        </label>
      </div>

      {!skipPricing && (
        <>
          {/* Import de fichiers */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Import de fichiers</h4>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Importez un fichier Excel ou une photo des tarifs pour une saisie automatique
            </p>
            <div className="flex items-center gap-4">
              <label className={`flex items-center gap-2 px-4 py-2 bg-white text-blue-500 border-2 border-blue-500 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Importer un fichier</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
              {isProcessing && <span className="text-sm text-gray-500">Traitement en cours...</span>}
            </div>
          </div>

          {/* Mode de tarification */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Mode de tarification</h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  Choisissez entre une tarification simple ou avancée
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimpleModeChange(false)}
                  className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    !formData.pricing?.simple
                      ? 'bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Avancé
                </button>
                <button
                  onClick={() => handleSimpleModeChange(true)}
                  className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    formData.pricing?.simple
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Simple
                </button>
              </div>
            </div>
          </div>

          {/* Tarifs par machine */}
          <div className="space-y-6">
            {formData.machines?.map((machine) => (
              <div key={machine.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* En-tête de la machine */}
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {machine.type === 'washer' ? (
                      <WashingMachine className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-purple-500" />
                    )}
                    <h4 className="text-sm sm:text-base font-medium text-gray-900">
                      {getMachineTypeName(machine.type)} {machine.capacity}
                    </h4>
                  </div>
                </div>

                {/* Liste des programmes */}
                <div className="p-4 sm:p-6 space-y-4">
                  {formData.pricing?.rates[machine.id]?.programs.map((program, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start sm:items-center">
                      {/* Nom du programme */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Programme
                        </label>
                        <input
                          type="text"
                          value={program.name}
                          onChange={(e) => handleProgramChange(machine.id, index, 'name', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl border border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          placeholder="Nom du programme"
                          disabled={formData.pricing?.simple}
                        />
                      </div>

                      {/* Durée */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Durée (minutes)
                        </label>
                        <input
                          type="number"
                          value={program.duration}
                          onChange={(e) => handleProgramChange(machine.id, index, 'duration', parseInt(e.target.value))}
                          min="0"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl border border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          placeholder="Durée"
                          disabled={formData.pricing?.simple}
                        />
                      </div>

                      {/* Prix */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          value={program.price}
                          onChange={(e) => handleProgramChange(machine.id, index, 'price', parseFloat(e.target.value))}
                          min="0"
                          step="0.1"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-xl border border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          placeholder="Prix"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Bouton d'ajout de programme (mode avancé uniquement) */}
                  {!formData.pricing?.simple && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleAddProgram(machine.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un programme
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PricingStep;
