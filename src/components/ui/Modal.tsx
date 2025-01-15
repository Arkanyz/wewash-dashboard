import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 flex items-center justify-center">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white w-full max-w-[90%] md:max-w-4xl rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#E5E9F2]">
            <h2 className="text-base md:text-lg font-semibold text-[#1a1a1a]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#F5F7FA] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-[#666666]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
