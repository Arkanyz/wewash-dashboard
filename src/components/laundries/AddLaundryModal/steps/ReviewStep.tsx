import React from 'react';
import { MapPin, Clock, WashingMachine, Loader2, Euro, CreditCard } from 'lucide-react';

interface ReviewStepProps {
  formData: {
    name: string;
    address: string;
    postalCode: string;
    city: string;
    openingHours: {
      [key: string]: {
        open: string;
        close: string;
        closed?: boolean;
      };
    };
    machines: Array<{
      id: string;
      type: 'washer' | 'dryer' | 'payment';
      brand?: string;
      capacity?: number | string;
      quantity: number;
    }>;
    pricing: {
      simple: boolean;
      rates: {
        [key: string]: {
          programs: Array<{
            name: string;
            duration: number;
            price: number;
          }>;
        };
      };
    };
  };
}

const DAYS_FR = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const getMachineIcon = (type: string) => {
    switch (type) {
      case 'washer':
        return WashingMachine;
      case 'dryer':
        return Loader2;
      case 'payment':
        return CreditCard;
      default:
        return WashingMachine;
    }
  };

  const getMachineTypeName = (type: string) => {
    switch (type) {
      case 'washer':
        return 'Lave-linge';
      case 'dryer':
        return 'Sèche-linge';
      case 'payment':
        return 'Borne de paiement';
      default:
        return type;
    }
  };

  const formatCapacity = (capacity: string | number) => {
    // Si la capacité se termine déjà par 'kg', on la retourne telle quelle
    if (typeof capacity === 'string' && capacity.endsWith('kg')) {
      return capacity;
    }
    // Sinon on ajoute 'kg'
    return `${capacity}kg`;
  };

  return (
    <div className="space-y-6">
      {/* Informations de base */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-500" />
          Informations de la laverie
        </h3>
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {formData.name}
          </p>
          <p className="text-base text-gray-600">
            {formData.address}
            <br />
            {formData.postalCode} {formData.city}
          </p>
        </div>
      </div>

      {/* Horaires */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          Horaires d'ouverture
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(DAYS_FR).map(([day, label]) => (
            <div key={day} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">{label}</span>
              <span className={`font-medium ${formData.openingHours[day]?.closed ? 'text-red-500' : 'text-blue-600'}`}>
                {formData.openingHours[day]?.closed ? (
                  'Fermé'
                ) : (
                  `${formData.openingHours[day]?.open} - ${formData.openingHours[day]?.close}`
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Équipements */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <WashingMachine className="w-5 h-5 text-blue-500" />
          Équipements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formData.machines.map((machine) => {
            const Icon = getMachineIcon(machine.type);
            return (
              <div key={machine.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  machine.type === 'washer' ? 'bg-blue-50 text-blue-500' :
                  machine.type === 'dryer' ? 'bg-purple-50 text-purple-500' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">
                    {getMachineTypeName(machine.type)}
                    {machine.capacity && ` ${formatCapacity(machine.capacity)}`}
                    {machine.quantity > 1 && ` (x${machine.quantity})`}
                  </p>
                  {machine.brand && (
                    <p className="text-sm text-gray-500">{machine.brand}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarifs */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Euro className="w-5 h-5 text-blue-500" />
          Tarification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {formData.machines.map((machine) => {
            const rates = formData.pricing.rates[machine.id];
            if (!rates?.programs?.length) return null;

            return (
              <div key={machine.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  {machine.type === 'washer' ? (
                    <WashingMachine className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-purple-500" />
                  )}
                  <p className="text-base font-medium text-gray-900">
                    {getMachineTypeName(machine.type)}
                    {machine.capacity && ` ${formatCapacity(machine.capacity)}`}
                  </p>
                </div>
                <div className="space-y-2">
                  {rates.programs.map((program) => (
                    <div key={program.name} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-gray-900 font-medium">
                          {program.name}
                        </span>
                        {program.duration > 0 && (
                          <p className="text-sm text-gray-500">
                            {program.duration} minutes
                          </p>
                        )}
                      </div>
                      <span className="text-lg font-semibold text-blue-600">{program.price}€</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
