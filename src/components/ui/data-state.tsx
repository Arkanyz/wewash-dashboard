import React from 'react';
import { Loader2, AlertCircle, Info } from 'lucide-react';

interface DataStateProps {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  children: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
}

export const DataState: React.FC<DataStateProps> = ({
  isLoading,
  error,
  isEmpty,
  children,
  loadingMessage = "Chargement en cours...",
  errorMessage = "Une erreur est survenue",
  emptyMessage = "Aucune donnée disponible"
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-center font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-500 space-y-4">
        <AlertCircle className="h-8 w-8" />
        <p className="text-center font-medium">{errorMessage}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 space-y-4">
        <Info className="h-8 w-8" />
        <div className="text-center max-w-md">
          <p className="font-medium">{emptyMessage}</p>
          <p className="text-sm mt-2">Les données s'afficheront automatiquement dès qu'elles seront disponibles.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
