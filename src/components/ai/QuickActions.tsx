import React from 'react';
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  return (
    <div className="flex flex-col gap-3 max-w-[340px]">
      <div className="flex justify-center gap-3">
        <Button 
          className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
          onClick={() => onAction('incidents')}
        >
          Incidents
        </Button>
        <Button 
          className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
          onClick={() => onAction('maintenance')}
        >
          Maintenance
        </Button>
      </div>
      <div className="flex justify-center gap-3">
        <Button 
          className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
          onClick={() => onAction('quickActions')}
        >
          Quick Actions
        </Button>
        <Button 
          className="flex-1 px-5 py-2 bg-white/50 text-gray-800 rounded-full hover:bg-white/70 transition-colors shadow-md text-center"
          onClick={() => onAction('help')}
        >
          Help
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
