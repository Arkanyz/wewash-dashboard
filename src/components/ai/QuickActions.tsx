import React from 'react';
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  return (
    <div className="flex flex-col gap-3 max-w-[340px]">
      {/* Tous les boutons d'action ont été supprimés */}
    </div>
  );
};

export default QuickActions;
