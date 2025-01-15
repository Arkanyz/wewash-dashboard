import React, { useState } from 'react';
import { X, Plus, MapPin, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LaundryData {
  name: string;
  address: string;
  ville: string;
  code_postal: string;
  size: 'small' | 'medium' | 'large';
  services: string[];
}

interface AddLaundryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (laundryData: LaundryData) => Promise<void>;
}

const availableServices = [
  { id: 'wifi', label: 'Wi-Fi Gratuit' },
  { id: 'waiting_area', label: 'Espace d\'attente' },
  { id: 'vending', label: 'Distributeurs' },
  { id: 'payment_terminal', label: 'Borne de paiement' },
  { id: 'air_conditioning', label: 'Climatisation' },
  { id: 'security_cameras', label: 'Caméras de sécurité' },
];

const AddLaundryModal: React.FC<AddLaundryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LaundryData>({
    name: '',
    address: '',
    ville: '',
    code_postal: '',
    size: 'medium',
    services: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      if (step === 1 && (!formData.name || !formData.address || !formData.ville || !formData.code_postal)) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setStep(step + 1);
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        ville: formData.ville.trim(),
        code_postal: formData.code_postal.trim(),
      };
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la laverie:', error);
      alert('Une erreur est survenue lors de la création de la laverie');
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
      [name]: value
    }));
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la laverie*
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/20 focus:outline-none"
                placeholder="Ex: Laverie du Centre"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Adresse complète*
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/20 focus:outline-none pl-10"
                  placeholder="Numéro et nom de rue"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="ville"
                  required
                  value={formData.ville}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/20 focus:outline-none"
                  placeholder="Ville"
                />
                <input
                  type="text"
                  name="code_postal"
                  required
                  value={formData.code_postal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/20 focus:outline-none"
                  placeholder="Code postal"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille de la laverie
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'small', label: 'Petite' },
                  { value: 'medium', label: 'Moyenne' },
                  { value: 'large', label: 'Grande' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, size: option.value as any }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.size === option.value
                        ? 'border-[#286BD4] bg-blue-50 text-[#286BD4]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services disponibles
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableServices.map(service => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.services.includes(service.id)
                        ? 'border-[#286BD4] bg-blue-50 text-[#286BD4]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {service.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Récapitulatif</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formData.address}, {formData.code_postal} {formData.ville}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Taille</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {formData.size === 'small' ? 'Petite' : 
                     formData.size === 'medium' ? 'Moyenne' : 'Grande'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Services</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formData.services.length > 0 
                      ? formData.services.map(id => 
                          availableServices.find(s => s.id === id)?.label
                        ).join(', ')
                      : 'Aucun service sélectionné'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-[#286BD4] to-[#1E5BB7] text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Nouvelle laverie
                </h2>
                <p className="mt-1 text-white/80">
                  Étape {step}/2 : {
                    step === 1 ? 'Informations générales' : 'Caractéristiques'
                  }
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

          <div className="relative">
            {/* Barre de progression */}
            <div className="px-8 py-6">
              <div className="max-w-[400px] mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex flex-col items-center">
                    <button
                      onClick={() => step > 1 && setStep(1)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step === 1
                          ? 'bg-[#286BD4] text-white ring-4 ring-blue-100'
                          : step > 1
                          ? 'bg-[#286BD4] text-white cursor-pointer hover:ring-4 hover:ring-blue-100'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      1
                    </button>
                    <span className="mt-2 text-sm font-medium text-gray-600">
                      Informations
                    </span>
                  </div>

                  <div className="flex-1 mx-4 pt-5">
                    <div className="h-1 rounded-full bg-gray-100">
                      <motion.div
                        className="h-full bg-[#286BD4] rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: step > 1 ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <button
                      onClick={() => step > 1 && setStep(2)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step === 2
                          ? 'bg-[#286BD4] text-white ring-4 ring-blue-100'
                          : step > 2
                          ? 'bg-[#286BD4] text-white cursor-pointer hover:ring-4 hover:ring-blue-100'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      2
                    </button>
                    <span className="mt-2 text-sm font-medium text-gray-600">
                      Caractéristiques
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {renderStepContent()}

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center px-6 py-3 bg-white text-gray-700 hover:text-gray-900 font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    Retour
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isSubmitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-[#286BD4] border-2 border-[#286BD4] hover:bg-blue-50'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : step < 2 ? (
                    'Suivant'
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Créer la laverie
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddLaundryModal;
