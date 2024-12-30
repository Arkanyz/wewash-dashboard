import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TechnicianFormData {
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
}

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (technicianData: TechnicianFormData) => Promise<void>;
}

const AddTechnicianModal: React.FC<AddTechnicianModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<TechnicianFormData>({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      specialty: '',
    });
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#111313] rounded-xl shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Ajouter un technicien</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Nom complet *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                    placeholder="jean.dupont@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                    placeholder="06 12 34 56 78"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Spécialité *</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                    placeholder="Électricien"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#99E5DC] text-[#1E201F] rounded-lg hover:bg-[#7BC5BC] transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const modalRoot = document.getElementById('modal-root');
  
  if (!mounted || !modalRoot) return null;
  
  return createPortal(modalContent, modalRoot);
};

export default AddTechnicianModal;
