import React from 'react';
import { X } from 'lucide-react';

interface CloseButtonProps {
  onClick: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-[#F5F7FA] rounded-full transition-colors"
      aria-label="Fermer"
    >
      <X className="w-5 h-5 text-[#666666]" />
    </button>
  );
};

export default CloseButton;
