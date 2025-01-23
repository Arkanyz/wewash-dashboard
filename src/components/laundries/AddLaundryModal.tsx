import React, { useState, useEffect } from 'react';
import { X, Plus, MapPin, Check, Loader2, Clock, CreditCard, Wifi, Parking, Wheelchair, Upload, AlertCircle, Fan, Camera, FileText, Euro } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { ClipboardList, WashingMachine } from '@/components/icons';
import { Dialog } from '@headlessui/react';
import type { LaundrySize, LaundryFeatures, PaymentType } from '../../types/laundry';

export interface LaundryFormData {
  name: string;
  address: string;
  address_complement?: string;
  ville: string;
  code_postal: string;
  size: LaundrySize;
  features: LaundryFeatures;
  contact_phone?: string;
  contact_email?: string;
  accepted_payments: PaymentType[];
  opening_hours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  };
  prices: {
    washing: Array<{
      capacity: number;
      programs: Array<{
        name: string;
        duration: number;
        price: number;
      }>;
    }>;
    drying: Array<{
      duration: number;
      price: number;
    }>;
    additional: Array<{
      name: string;
      price: number;
    }>;
  };
}

interface AddLaundryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (laundryData: FormData) => Promise<void>;
}

const PAYMENT_OPTIONS: { id: PaymentType; label: string; icon: React.ReactNode }[] = [
  { id: 'card', label: 'Carte bancaire', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'cash', label: 'Espèces', icon: <span className="text-lg">€</span> },
  { id: 'mobile', label: 'Paiement mobile', icon: <span className="text-lg">📱</span> }
];

const FEATURES_OPTIONS = [
  { id: 'wifi', label: 'Wi-Fi Gratuit', icon: <Wifi className="w-4 h-4" /> },
  { id: 'waiting_area', label: 'Espace d\'attente', icon: <Clock className="w-4 h-4" /> },
  { id: 'vending', label: 'Distributeurs', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'payment_terminal', label: 'Borne de paiement', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'air_conditioning', label: 'Climatisation', icon: <Fan className="w-4 h-4" /> },
  { id: 'security_cameras', label: 'Caméras de sécurité', icon: <Camera className="w-4 h-4" /> }
];

interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    open: string;
    close: string;
  };
}

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { isOpen: true, open: '08:00', close: '20:00' },
  tuesday: { isOpen: true, open: '08:00', close: '20:00' },
  wednesday: { isOpen: true, open: '08:00', close: '20:00' },
  thursday: { isOpen: true, open: '08:00', close: '20:00' },
  friday: { isOpen: true, open: '08:00', close: '20:00' },
  saturday: { isOpen: true, open: '08:00', close: '20:00' },
  sunday: { isOpen: true, open: '08:00', close: '20:00' },
};

const DAYS_FR = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

const WASHING_CAPACITIES = [6, 8, 10, 12, 14, 18];
const DEFAULT_WASHING_PROGRAMS = [
  { name: 'Froid', duration: 30 },
  { name: 'Normal 30°', duration: 35 },
  { name: 'Normal 40°', duration: 45 },
  { name: 'Intensif 60°', duration: 60 },
  { name: 'Délicat', duration: 40 }
];

const DEFAULT_ADDITIONAL_SERVICES = [
  { name: 'Lessive', price: 1 },
  { name: 'Assouplissant', price: 1 },
  { name: 'Désinfectant', price: 1.5 },
  { name: 'Sac à linge', price: 2 }
];

const AddLaundryModal: React.FC<AddLaundryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LaundryFormData>({
    name: '',
    address: '',
    ville: '',
    code_postal: '',
    size: 'medium',
    features: {
      wifi: false,
      waiting_area: false,
      vending: false,
      payment_terminal: false,
      air_conditioning: false,
      security_cameras: false
    },
    accepted_payments: ['card', 'cash'],
    opening_hours: DEFAULT_OPENING_HOURS,
    prices: {
      washing: WASHING_CAPACITIES.map(capacity => ({
        capacity,
        programs: DEFAULT_WASHING_PROGRAMS.map(prog => ({
          ...prog,
          price: capacity <= 8 ? 4 : capacity <= 12 ? 6 : 8
        }))
      })),
      drying: [
        { duration: 10, price: 1 },
        { duration: 15, price: 1.5 },
        { duration: 20, price: 2 }
      ],
      additional: DEFAULT_ADDITIONAL_SERVICES
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [priceFile, setPriceFile] = useState<File | null>(null);
  const [showPriceWarning, setShowPriceWarning] = useState(false);
  const [tarifMode, setTarifMode] = useState<'simple' | 'file'>('simple');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    
    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est requise';
    }
    
    if (!formData.code_postal.trim()) {
      newErrors.code_postal = 'Le code postal est requis';
    } else if (!/^\d{5}$/.test(formData.code_postal)) {
      newErrors.code_postal = 'Le code postal doit contenir 5 chiffres';
    }

    if (formData.contact_email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.contact_email)) {
      newErrors.contact_email = 'Email invalide';
    }

    if (formData.contact_phone && !/^\+?[0-9\s-]{10,}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Numéro de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1 && !validateForm()) {
      return;
    }
    
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    if (!priceFile && tarifMode === 'file') {
      setShowPriceWarning(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Créer un FormData pour envoyer le fichier
      const formDataToSend = new FormData();
      if (priceFile) {
        formDataToSend.append('priceFile', priceFile);
      }
      formDataToSend.append('data', JSON.stringify({
        ...formData,
        opening_hours: Object.fromEntries(Object.entries(formData.opening_hours).map(([day, hours]) => [day, {
          open: hours.isOpen ? hours.open : '00:00',
          close: hours.isOpen ? hours.close : '00:00'
        }]))
      }));

      await onSubmit(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la laverie:', error);
      alert('Une erreur est survenue lors de la création de la laverie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTimeChange = (day: string, type: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [type]: value
        }
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (file.type === 'text/plain' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'image/jpeg' || 
          file.type === 'image/png') {
        setPriceFile(file);
        setShowPriceWarning(false);
      } else {
        alert('Format de fichier non supporté. Veuillez utiliser un fichier .txt, .xlsx, .jpg ou .png');
      }
    }
  };

  const handlePriceChange = (machineIndex: number, programIndex: number, value: string) => {
    const newPrices = {...formData.prices};
    newPrices.washing[machineIndex].programs[programIndex].price = parseFloat(value);
    setFormData(prev => ({...prev, prices: newPrices}));
  };

  const handleDryingPriceChange = (index: number, value: string) => {
    const newPrices = {...formData.prices};
    newPrices.drying[index].price = parseFloat(value);
    setFormData(prev => ({...prev, prices: newPrices}));
  };

  const handleAdditionalPriceChange = (index: number, value: string) => {
    const newPrices = {...formData.prices};
    newPrices.additional[index].price = parseFloat(value);
    setFormData(prev => ({...prev, prices: newPrices}));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPriceFile(file);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#286BD4] to-[#286BD4]/90 text-white shadow-lg shadow-[#286BD4]/20 ring-8 ring-[#286BD4]/10">
                  1
                </div>
                <span className="text-sm font-medium text-[#286BD4]">Informations</span>
              </div>
              <div className="h-0.5 w-24 bg-gradient-to-r from-gray-200 to-gray-100"></div>
              <div className="flex items-center gap-3">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 ring-8 ring-gray-50">
                  2
                </div>
                <span className="text-sm font-medium text-gray-400">Configuration</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la laverie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white rounded-xl border-2 border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-4 focus:ring-[#286BD4]/10 transition-all duration-200 placeholder:text-gray-400 hover:border-[#286BD4]/30"
                  placeholder="Nom de votre laverie"
                />
                {errors.name && <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.name}
                </p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-4 focus:ring-[#286BD4]/10 transition-all duration-200 placeholder:text-gray-400 hover:border-[#286BD4]/30"
                    placeholder="Numéro et nom de rue"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
                {errors.address && <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.address}
                </p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="code_postal" className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code_postal"
                    value={formData.code_postal}
                    onChange={(e) => handleInputChange('code_postal', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white rounded-xl border-2 border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-4 focus:ring-[#286BD4]/10 transition-all duration-200 placeholder:text-gray-400 hover:border-[#286BD4]/30"
                    placeholder="Code postal"
                  />
                  {errors.code_postal && <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {errors.code_postal}
                  </p>}
                </div>
                <div>
                  <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="ville"
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white rounded-xl border-2 border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-4 focus:ring-[#286BD4]/10 transition-all duration-200 placeholder:text-gray-400 hover:border-[#286BD4]/30"
                    placeholder="Ville"
                  />
                  {errors.ville && <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {errors.ville}
                  </p>}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="group px-6 py-3 rounded-xl bg-gradient-to-r from-[#286BD4] to-[#286BD4]/90 text-white font-medium flex items-center gap-2 transition-all duration-200 shadow-lg shadow-[#286BD4]/25 hover:shadow-xl hover:shadow-[#286BD4]/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#286BD4]/20"
              >
                Continuer
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-[#286BD4] text-white shadow-lg shadow-[#286BD4]/20 ring-8 ring-[#286BD4]/10">
                  1
                </div>
                <span className="text-sm font-medium text-gray-400">Informations</span>
              </div>
              <div className="h-0.5 w-24 bg-[#286BD4]"></div>
              <div className="flex items-center gap-3">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-[#286BD4] text-white shadow-lg shadow-[#286BD4]/20 ring-8 ring-[#286BD4]/10">
                  2
                </div>
                <span className="text-sm font-medium text-[#286BD4]">Configuration</span>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-100/80 text-blue-600 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-sm text-blue-800">
                Veuillez renseigner vos horaires d'ouverture et importer vos tarifs. Ces informations sont essentielles pour permettre à notre assistant de répondre précisément aux questions de vos clients.
              </p>
            </div>

            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#286BD4]" />
                  Horaires d'ouverture
                </h3>
                <div className="bg-white rounded-xl border-2 border-[#286BD4]/20 overflow-hidden">
                  <div className="grid grid-cols-2 divide-x-2 divide-[#286BD4]/10">
                    <div className="p-4 space-y-3">
                      {Object.entries(formData.opening_hours).slice(0, 4).map(([day, hours]) => (
                        <div 
                          key={day} 
                          className="flex items-center space-x-4 hover:bg-gray-50/80 rounded-lg p-2 transition-all duration-200"
                        >
                          <div className="w-28">
                            <span className="font-medium text-gray-700">{DAYS_FR[day]}</span>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={hours.isOpen}
                              onChange={(e) => {
                                const newHours = { ...formData.opening_hours };
                                newHours[day] = {
                                  ...hours,
                                  isOpen: e.target.checked,
                                  open: e.target.checked ? '08:00' : '00:00',
                                  close: e.target.checked ? '19:00' : '00:00'
                                };
                                setFormData(prev => ({
                                  ...prev,
                                  opening_hours: newHours
                                }));
                              }}
                            />
                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#286BD4] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:border-2 after:border-gray-200 peer-checked:after:border-[#286BD4] shadow-sm peer-checked:shadow-[#286BD4]/20"></div>
                          </label>

                          {hours.isOpen && (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200 text-sm"
                              />
                              <span className="text-gray-400 text-sm">à</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 space-y-3">
                      {Object.entries(formData.opening_hours).slice(4).map(([day, hours]) => (
                        <div 
                          key={day} 
                          className="flex items-center space-x-4 hover:bg-gray-50/80 rounded-lg p-2 transition-all duration-200"
                        >
                          <div className="w-28">
                            <span className="font-medium text-gray-700">{DAYS_FR[day]}</span>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={hours.isOpen}
                              onChange={(e) => {
                                const newHours = { ...formData.opening_hours };
                                newHours[day] = {
                                  ...hours,
                                  isOpen: e.target.checked,
                                  open: e.target.checked ? '08:00' : '00:00',
                                  close: e.target.checked ? '19:00' : '00:00'
                                };
                                setFormData(prev => ({
                                  ...prev,
                                  opening_hours: newHours
                                }));
                              }}
                            />
                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#286BD4] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:border-2 after:border-gray-200 peer-checked:after:border-[#286BD4] shadow-sm peer-checked:shadow-[#286BD4]/20"></div>
                          </label>

                          {hours.isOpen && (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200 text-sm"
                              />
                              <span className="text-gray-400 text-sm">à</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#286BD4]" />
                  Tarifs
                </h3>
                <div className="bg-white rounded-xl border-2 border-[#286BD4]/20 p-6">
                  <div className="space-y-6">
                    {/* Option de saisie */}
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setTarifMode('simple')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          tarifMode === 'simple' 
                            ? 'border-[#286BD4] bg-[#286BD4]/5 shadow-lg shadow-[#286BD4]/10' 
                            : 'border-gray-200 hover:border-[#286BD4]/30'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <ClipboardList className="w-5 h-5 text-[#286BD4]" />
                          <span className="font-medium text-gray-700">Saisie manuelle</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Remplissez simplement le formulaire avec vos tarifs
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTarifMode('file')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          tarifMode === 'file' 
                            ? 'border-[#286BD4] bg-[#286BD4]/5 shadow-lg shadow-[#286BD4]/10' 
                            : 'border-gray-200 hover:border-[#286BD4]/30'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Upload className="w-5 h-5 text-[#286BD4]" />
                          <span className="font-medium text-gray-700">Importer un fichier</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Importez une photo ou un fichier Excel
                        </p>
                      </button>
                    </div>

                    {tarifMode === 'simple' ? (
                      <div className="space-y-8">
                        {/* Machines à laver */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <WashingMachine className="w-4 h-4 text-[#286BD4]" />
                            Machines à laver
                          </h4>
                          <div className="grid gap-6">
                            {formData.prices.washing.map((machine, machineIndex) => (
                              <div key={machine.capacity} className="space-y-3">
                                <h5 className="text-sm font-medium text-gray-600">
                                  Machine {machine.capacity}kg
                                </h5>
                                <div className="grid gap-3">
                                  {machine.programs.map((program, programIndex) => (
                                    <div key={program.name} className="flex items-center gap-4">
                                      <div className="w-32">
                                        <span className="text-sm text-gray-600">{program.name}</span>
                                        <span className="text-xs text-gray-400 block">
                                          {program.duration} min
                                        </span>
                                      </div>
                                      <div className="relative w-32">
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          value={program.price}
                                          onChange={(e) => handlePriceChange(machineIndex, programIndex, e.target.value)}
                                          className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200 text-sm"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Séchoirs */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#286BD4]" />
                            Séchoirs
                          </h4>
                          <div className="grid gap-3">
                            {formData.prices.drying.map((option, index) => (
                              <div key={option.duration} className="flex items-center gap-4">
                                <div className="w-32">
                                  <span className="text-sm text-gray-600">{option.duration} minutes</span>
                                </div>
                                <div className="relative w-32">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={option.price}
                                    onChange={(e) => handleDryingPriceChange(index, e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200 text-sm"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Services additionnels */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-[#286BD4]" />
                            Services additionnels
                          </h4>
                          <div className="grid gap-3">
                            {formData.prices.additional.map((service, index) => (
                              <div key={service.name} className="flex items-center gap-4">
                                <div className="w-32">
                                  <span className="text-sm text-gray-600">{service.name}</span>
                                </div>
                                <div className="relative w-32">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={service.price}
                                    onChange={(e) => handleAdditionalPriceChange(index, e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-[#286BD4]/20 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200 text-sm"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#286BD4]/30 transition-all">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.xls,.xlsx"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-3"
                          >
                            <div className="w-12 h-12 rounded-full bg-[#286BD4]/10 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-[#286BD4]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">
                                Cliquez pour importer votre fichier
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Photo, PDF, ou fichier Excel accepté
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl border-2 border-[#286BD4]/20 text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 hover:border-[#286BD4]/30"
              >
                Retour
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#286BD4] text-white hover:bg-[#286BD4]/90 font-medium flex items-center gap-2 transition-all duration-200 shadow-lg shadow-[#286BD4]/25 hover:shadow-xl hover:shadow-[#286BD4]/30 hover:-translate-y-0.5"
              >
                Terminer
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-gray-900/40 to-gray-900/50 backdrop-blur-sm"
      onClick={handleClickOutside}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl bg-gradient-to-b from-white to-gray-50/80 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] transition-all"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-7 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">
                Ajouter une laverie
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {step === 1 ? "Renseignez les informations de base" : "Configurez les horaires et tarifs"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#286BD4]/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-7">
            {renderStepContent()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLaundryModal;
