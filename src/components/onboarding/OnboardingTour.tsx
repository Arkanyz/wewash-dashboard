import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: 'Bienvenue sur WeWash Dashboard',
    content: 'Votre tableau de bord centralisé pour la gestion de vos machines.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="calendar"]',
    title: 'Calendrier des Incidents',
    content: 'Visualisez et gérez tous vos incidents. Sélectionnez une plage de dates pour extraire les données.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="alerts"]',
    title: 'Configuration des Alertes',
    content: 'Personnalisez vos notifications pour rester informé des événements importants.',
    placement: 'left'
  },
  {
    target: '[data-tour="machines"]',
    title: 'État des Machines',
    content: 'Surveillez l\'état de vos machines en temps réel.',
    placement: 'right'
  }
];

interface OnboardingTourProps {
  isFirstVisit: boolean;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isFirstVisit, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isFirstVisit);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isVisible) return;
    
    const updatePosition = () => {
      const currentTarget = document.querySelector(tourSteps[currentStep].target);
      if (!currentTarget) return;

      const rect = currentTarget.getBoundingClientRect();
      const { placement } = tourSteps[currentStep];
      
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          break;
      }

      setTooltipPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep === tourSteps.length - 1) {
      setIsVisible(false);
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bg-[#1A1C1A] text-white p-6 rounded-lg shadow-xl"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{tourSteps[currentStep].title}</h3>
            <p className="text-gray-300">{tourSteps[currentStep].content}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-[#99E5DC]' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-white"
              >
                Passer
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#99E5DC] text-black rounded-lg hover:bg-opacity-90"
              >
                {currentStep === tourSteps.length - 1 ? 'Terminer' : 'Suivant'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
