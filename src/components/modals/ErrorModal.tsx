import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl w-full max-w-md mx-4"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="bg-red-50 p-6 rounded-t-3xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-medium">Erreur</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-3xl hover:bg-red-100 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorModal;
