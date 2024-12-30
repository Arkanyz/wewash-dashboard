import React, { createContext, useContext, useState, useEffect } from 'react';
import OnboardingTour from './OnboardingTour';
import AlertsSetup from './AlertsSetup';

interface OnboardingContextType {
  showTour: boolean;
  showAlertsSetup: boolean;
  completeTour: () => void;
  completeAlertsSetup: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [showTour, setShowTour] = useState(false);
  const [showAlertsSetup, setShowAlertsSetup] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('hasCompletedTour');
    const hasSetupAlerts = localStorage.getItem('hasSetupAlerts');

    if (!hasCompletedTour) {
      setShowTour(true);
    } else if (!hasSetupAlerts) {
      setShowAlertsSetup(true);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('hasCompletedTour', 'true');
    setShowTour(false);
    setShowAlertsSetup(true);
  };

  const completeAlertsSetup = () => {
    localStorage.setItem('hasSetupAlerts', 'true');
    setShowAlertsSetup(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        showTour,
        showAlertsSetup,
        completeTour,
        completeAlertsSetup,
      }}
    >
      {children}
      {showTour && <OnboardingTour isFirstVisit={true} onComplete={completeTour} />}
      {!showTour && showAlertsSetup && <AlertsSetup onComplete={completeAlertsSetup} />}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
