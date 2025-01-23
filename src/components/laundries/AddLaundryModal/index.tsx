import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, MapPin, WashingMachine, Euro, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InformationStep from './steps/InformationStep';
import MachinesStep from './steps/MachinesStep';
import PricingStep from './steps/PricingStep';
import ReviewStep from './steps/ReviewStep';
import { toast } from '@/components/ui/use-toast';
import { useSupabase } from '../../../hooks/useSupabase';

const STEPS = [
  {
    id: 'information',
    title: 'Informations',
    icon: MapPin,
    component: InformationStep
  },
  {
    id: 'machines',
    title: 'Équipements',
    icon: WashingMachine,
    component: MachinesStep
  },
  {
    id: 'pricing',
    title: 'Tarifs',
    icon: Euro,
    component: PricingStep
  },
  {
    id: 'review',
    title: 'Validation',
    icon: Check,
    component: ReviewStep
  }
];

interface AddLaundryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLaundryModal: React.FC<AddLaundryModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    machines: [],
    pricing: {
      simple: true,
      rates: {}
    },
    openingHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '08:00', close: '20:00', closed: true }
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase } = useSupabase();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('Début de la soumission');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Utilisateur non authentifié');
      console.log('Utilisateur authentifié:', user.id);

      // Création de la laverie
      const laundryData = {
        name: formData.name,
        address: formData.address,
        ville: formData.city,
        code_postal: formData.postalCode,
        opening_hours: formData.openingHours,
        has_pricing: !formData.pricing?.skipped,
        owner_id: user.id
      };
      console.log('Données laverie à insérer:', laundryData);

      const { data: laundry, error: laundryError } = await supabase
        .from('laundries')
        .insert(laundryData)
        .select()
        .single();

      if (laundryError) {
        console.error('Erreur détaillée laverie:', laundryError);
        throw laundryError;
      }
      console.log('Laverie créée:', laundry);

      // Ajout des machines
      if (formData.machines && formData.machines.length > 0) {
        console.log('Machines à ajouter:', formData.machines);
        
        const machines = formData.machines.map((machine: any) => ({
          laundry_id: laundry.id,
          type: machine.type,
          capacity: parseInt(machine.capacity.replace('kg', '')),
          brand: machine.brand || null,
          model: machine.model || null,
          owner_id: user.id
        }));
        console.log('Données machines à insérer:', machines);

        const { data: createdMachines, error: machinesError } = await supabase
          .from('machines')
          .insert(machines)
          .select();

        if (machinesError) {
          console.error('Erreur détaillée machines:', machinesError);
          throw machinesError;
        }
        console.log('Machines créées:', createdMachines);

        // Ajout des tarifs seulement s'ils n'ont pas été ignorés
        if (!formData.pricing?.skipped && formData.pricing?.rates) {
          console.log('Tarifs à ajouter:', formData.pricing.rates);
          
          const machineIdMap = createdMachines.reduce((acc: any, machine: any, index: number) => {
            acc[formData.machines[index].id] = machine.id;
            return acc;
          }, {});
          console.log('Mapping des IDs machines:', machineIdMap);

          const rates = Object.entries(formData.pricing.rates).map(([oldMachineId, rate]: [string, any]) => ({
            machine_id: machineIdMap[oldMachineId],
            laundry_id: laundry.id,
            programs: rate.programs,
            owner_id: user.id
          }));
          console.log('Données tarifs à insérer:', rates);

          if (rates.length > 0) {
            const { error: ratesError } = await supabase
              .from('rates')
              .insert(rates);

            if (ratesError) {
              console.error('Erreur détaillée tarifs:', ratesError);
              throw ratesError;
            }
            console.log('Tarifs créés avec succès');
          }
        }
      }

      toast({
        title: 'Laverie ajoutée avec succès',
        description: formData.pricing?.skipped 
          ? 'La laverie a été ajoutée. N\'oubliez pas de configurer les tarifs plus tard pour activer l\'assistant vocal.'
          : 'La laverie a été ajoutée à votre liste',
      });
      console.log('Toast affiché, fermeture de la modale');
      onClose();
      // Rafraîchir la page pour voir la nouvelle laverie
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur complète lors de l\'ajout de la laverie:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'ajout de la laverie',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
      console.log('Fin de la soumission');
    }
  };

  const renderStep = () => {
    const StepComponent = STEPS[currentStep].component;
    return <StepComponent 
      formData={formData} 
      onChange={setFormData}
      setFormData={setFormData} 
    />;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-4xl bg-white sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
          {/* Header avec gradient */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-8 py-4 sm:py-6 sm:rounded-t-3xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg sm:text-xl font-semibold text-white">
                Ajouter une laverie
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-8">
              {/* Barre de progression */}
              <div className="sticky top-0 z-10 bg-white pb-6 sm:pb-8 mb-6 sm:mb-8">
                <div className="relative">
                  {/* Version mobile de la barre de progression */}
                  <div className="block sm:hidden mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-blue-500">
                        Étape {currentStep + 1} sur {STEPS.length}
                      </span>
                      <span className="text-gray-500">
                        {STEPS[currentStep].title}
                      </span>
                    </div>
                    <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>

                  {/* Version desktop de la barre de progression */}
                  <div className="hidden sm:block">
                    <div className="flex justify-between">
                      {STEPS.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = currentStep === index;
                        const isPast = currentStep > index;
                        
                        return (
                          <div key={step.id} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-110'
                                  : isPast
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              <StepIcon className="w-6 h-6" />
                            </div>
                            <span className={`mt-3 text-sm font-medium ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Barre de progression animée */}
                    <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-100">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-blue-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu de l'étape */}
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="sticky bottom-0 z-10 bg-white mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-blue-500 font-semibold rounded-xl sm:rounded-2xl border-2 border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentStep === 0 || isSubmitting}
                  >
                    Retour
                  </button>
                  {currentStep === STEPS.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Ajout en cours...' : 'Ajouter la laverie'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-blue-600 transition-colors"
                    >
                      Suivant
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddLaundryModal;
