import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaundryFormData {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  contact_name: string;
  phone: string;
  email: string;
}

interface AddLaundryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (laundryData: LaundryFormData) => Promise<void>;
}

const AddLaundryModal: React.FC<AddLaundryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<LaundryFormData>({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    contact_name: '',
    phone: '',
    email: '',
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
      name: '',
      address: '',
      city: '',
      postal_code: '',
      contact_name: '',
      phone: '',
      email: '',
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#111313] rounded-xl shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Ajouter une laverie</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  {/* Informations de la laverie */}
                  <div>
                    <h3 className="text-sm font-medium text-[#99E5DC] mb-3">Informations de la laverie</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Nom de la laverie *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                          placeholder="Laverie Centrale"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Adresse */}
                  <div>
                    <h3 className="text-sm font-medium text-[#99E5DC] mb-3">Adresse</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Adresse *</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                          placeholder="123 rue de la Laverie"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-gray-400">Ville *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                            placeholder="Paris"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Code postal *</label>
                          <input
                            type="text"
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                            placeholder="75001"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h3 className="text-sm font-medium text-[#99E5DC] mb-3">Contact</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Nom du contact *</label>
                        <input
                          type="text"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                          placeholder="Jean Dupont"
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
                        <label className="text-sm text-gray-400">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#1E201F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99E5DC]"
                          placeholder="contact@laverie.fr"
                          required
                        />
                      </div>
                    </div>
                  </div>
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

export default AddLaundryModal;
