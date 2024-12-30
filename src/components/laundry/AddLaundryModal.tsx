import React, { useState } from 'react';
import { X, MapPin, Phone, User, Mail, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddLaundryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (laundryData: LaundryData) => void;
}

export interface LaundryData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  contactName: string;
  phone: string;
  email: string;
}

const AddLaundryModal: React.FC<AddLaundryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<LaundryData>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    contactName: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      contactName: '',
      phone: '',
      email: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1A1C1A] rounded-lg p-6 w-full max-w-xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold mb-6">Ajouter une nouvelle laverie</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom de la laverie"
                  className="w-full pl-10 pr-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
                  required
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adresse"
                  className="w-full pl-10 pr-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ville"
                    className="w-full px-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Code postal"
                    className="w-full px-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Nom du contact"
                  className="w-full pl-10 pr-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Téléphone"
                  className="w-full pl-10 pr-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#99E5DC] text-black rounded-lg hover:bg-opacity-90"
              >
                Ajouter
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddLaundryModal;
