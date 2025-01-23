import React, { useState } from 'react';
import { Check, MapPin, WashingMachine, Euro, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { useToast } from '@/hooks/useToast';

const STEPS = [
  {
    id: 'location',
    title: 'Informations de base',
    icon: MapPin,
    description: 'Localisation et horaires'
  },
  {
    id: 'machines',
    title: 'Équipements',
    icon: WashingMachine,
    description: 'Ajout des machines'
  },
  {
    id: 'pricing',
    title: 'Tarification',
    icon: Euro,
    description: 'Configuration des prix'
  },
  {
    id: 'review',
    title: 'Validation',
    icon: Check,
    description: 'Aperçu et confirmation'
  }
];

interface Location {
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
}

interface Machine {
  id: string;
  type: 'washer' | 'dryer' | 'payment';
  brand?: string;
  capacity?: number;
  quantity: number;
}

interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

interface LaundryData {
  name: string;
  location: Location;
  openingHours: OpeningHours;
  machines: Machine[];
  pricing: {
    simple: boolean;
    rates: any; // À typer plus précisément selon vos besoins
  };
}

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: '07:00', close: '22:00' },
  tuesday: { open: '07:00', close: '22:00' },
  wednesday: { open: '07:00', close: '22:00' },
  thursday: { open: '07:00', close: '22:00' },
  friday: { open: '07:00', close: '22:00' },
  saturday: { open: '07:00', close: '22:00' },
  sunday: { open: '07:00', close: '22:00' }
};

export const AddLaundryWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<LaundryData>({
    name: '',
    location: {
      address: '',
      city: '',
      postalCode: '',
      lat: 0,
      lng: 0
    },
    openingHours: DEFAULT_OPENING_HOURS,
    machines: [],
    pricing: {
      simple: true,
      rates: {}
    }
  });

  const { toast } = useToast();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

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
      // Logique de soumission
      toast({
        title: 'Laverie ajoutée avec succès !',
        description: 'Votre nouvelle laverie a été créée.',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la laverie.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Barre de progression */}
      <div className="relative">
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === index;
            const isPast = currentStep > index;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-[#286BD4] text-white shadow-lg shadow-[#286BD4]/20'
                      : isPast
                      ? 'bg-[#286BD4] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <span className={`mt-2 text-sm font-medium ${isActive ? 'text-[#286BD4]' : 'text-gray-500'}`}>
                  {step.title}
                </span>
                <span className={`text-xs ${isActive ? 'text-[#286BD4]' : 'text-gray-400'}`}>
                  {step.description}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Barre de progression animée */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#286BD4]"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Le contenu de chaque étape sera ajouté ici */}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium
            ${currentStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
          `}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
        <button
          onClick={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
          className="flex items-center px-4 py-2 bg-[#286BD4] text-white rounded-lg text-sm font-medium hover:bg-[#286BD4]/90"
        >
          {currentStep === STEPS.length - 1 ? (
            'Ajouter la laverie'
          ) : (
            <>
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
