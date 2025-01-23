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
      capacity?: number;
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

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
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

  return (
    <div className="space-y-8">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#286BD4]" />
          Informations de la laverie
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid gap-2">
            <p className="text-sm">
              <span className="font-medium">{formData.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              {formData.address}
              <br />
              {formData.postalCode} {formData.city}
            </p>
          </div>
        </div>
      </div>

      {/* Horaires */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#286BD4]" />
          Horaires d'ouverture
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid gap-2">
            {Object.entries(DAYS_FR).map(([day, label]) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium">
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
      </div>

      {/* Équipements */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <WashingMachine className="w-4 h-4 text-[#286BD4]" />
          Équipements
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="divide-y divide-gray-200">
            {formData.machines.map((machine) => {
              const Icon = getMachineIcon(machine.type);
              return (
                <div key={machine.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#286BD4]" />
                    <div>
                      <p className="text-sm font-medium">
                        {getMachineTypeName(machine.type)}
                        {machine.capacity && ` ${machine.capacity}kg`}
                        {machine.quantity > 1 && ` (x${machine.quantity})`}
                      </p>
                      {machine.brand && (
                        <p className="text-sm text-gray-500">{machine.brand}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tarifs */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Euro className="w-4 h-4 text-[#286BD4]" />
          Tarification
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            {formData.machines.map((machine) => {
              const rates = formData.pricing.rates[machine.id];
              if (!rates?.programs?.length) return null;

              return (
                <div key={machine.id} className="space-y-2">
                  <p className="text-sm font-medium">
                    {getMachineTypeName(machine.type)}
                    {machine.capacity && ` ${machine.capacity}kg`}
                  </p>
                  <div className="ml-4 space-y-1">
                    {rates.programs.map((program) => (
                      <div key={program.name} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {program.name}
                          {program.duration && ` (${program.duration} min)`}
                        </span>
                        <span className="font-medium">{program.price}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
