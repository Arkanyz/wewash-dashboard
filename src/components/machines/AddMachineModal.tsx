import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (machineData: MachineData) => Promise<void>;
  laundryId: string;
}

export interface MachineData {
  type: 'washer' | 'dryer' | 'terminal';
  brand: string;
  capacity?: string;
  quantity: number;
}

const AddMachineModal: React.FC<AddMachineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  laundryId
}) => {
  const [formData, setFormData] = useState<MachineData>({
    type: 'washer',
    brand: '',
    capacity: '',
    quantity: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des machines:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-[#286BD4] to-[#1E5BB7] text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Ajouter des équipements
                </h2>
                <p className="mt-1 text-white/80">
                  Remplissez les informations ci-dessous
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'équipement*
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'washer', label: 'Lave-linge' },
                  { value: 'dryer', label: 'Sèche-linge' },
                  { value: 'terminal', label: 'Borne' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: option.value as any }))}
                    className={`p-4 rounded-xl border transition-all ${
                      formData.type === option.value
                        ? 'border-[#286BD4] bg-blue-50 text-[#286BD4]'
                        : 'border-[#E8F0FE] bg-white hover:bg-blue-50/50 text-[#286BD4]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marque
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/20 focus:outline-none"
                placeholder="Ex: Miele, Electrolux..."
              />
            </div>

            {formData.type !== 'terminal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/20 focus:outline-none"
                  placeholder="Ex: 10 kg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                max="20"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/20 focus:outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Les équipements seront automatiquement numérotés
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#286BD4] text-white rounded-xl hover:bg-[#1E5BB7] transition-all duration-200 font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 focus:ring-2 focus:ring-[#286BD4]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddMachineModal;
