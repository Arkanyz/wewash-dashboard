import { useState, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';

interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const addNotification = useAppStore((state) => state.addNotification);

  const handleError = useCallback((error: any) => {
    let errorState: ErrorState = {
      message: 'Une erreur est survenue',
      code: 'UNKNOWN_ERROR'
    };

    // Gérer les erreurs Supabase
    if (error?.code) {
      switch (error.code) {
        case 'PGRST301':
          errorState = {
            message: 'Session expirée. Veuillez vous reconnecter.',
            code: 'SESSION_EXPIRED'
          };
          break;
        case 'PGRST204':
          errorState = {
            message: 'Accès non autorisé.',
            code: 'UNAUTHORIZED'
          };
          break;
        default:
          errorState = {
            message: error.message || 'Erreur serveur',
            code: error.code
          };
      }
    }

    // Gérer les erreurs réseau
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      errorState = {
        message: 'Problème de connexion. Vérifiez votre connexion internet.',
        code: 'NETWORK_ERROR'
      };
    }

    // Stocker l'erreur
    setError(errorState);

    // Ajouter une notification si nécessaire
    if (errorState.code !== 'SILENT_ERROR') {
      addNotification({
        id: Date.now().toString(),
        title: 'Erreur',
        message: errorState.message,
        type: 'error',
        user_id: useAppStore.getState().currentUser?.id || '',
        read: false,
        created_at: new Date().toISOString()
      });
    }

    // Log l'erreur pour le debugging
    console.error('Error handled:', {
      ...errorState,
      originalError: error
    });

    return errorState;
  }, [addNotification]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}
