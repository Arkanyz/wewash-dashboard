import React from 'react';
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  return (
    <div className="bg-[#286BD4] rounded-3xl h-full p-6 shadow-xl">
      {/* Tous les boutons d'action ont été supprimés */}
    </div>
  );
};

export default QuickActions;
