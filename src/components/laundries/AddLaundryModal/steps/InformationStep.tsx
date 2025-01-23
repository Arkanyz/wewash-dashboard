import React from 'react';
import { MapPin, Clock } from 'lucide-react';

interface InformationStepProps {
  formData: any;
  setFormData: (data: any) => void;
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

const InformationStep: React.FC<InformationStepProps> = ({ formData, setFormData }) => {
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleDayClosed = (day: string, closed: boolean) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          closed
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Section des informations de base */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-500" />
          <span className="text-gray-600 font-medium">Informations de base</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nom de la laverie
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full h-11 px-4 text-gray-600 bg-white/80 rounded-xl border border-gray-200 
                hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10
                placeholder-gray-400"
              placeholder="Ma laverie"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full h-11 px-4 text-gray-600 bg-white/80 rounded-xl border border-gray-200 
                hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10
                placeholder-gray-400"
              placeholder="123 rue de la Laverie"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Code postal
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full h-11 px-4 text-gray-600 bg-white/80 rounded-xl border border-gray-200 
                  hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10
                  placeholder-gray-400"
                placeholder="75000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full h-11 px-4 text-gray-600 bg-white/80 rounded-xl border border-gray-200 
                  hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10
                  placeholder-gray-400"
                placeholder="Paris"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section des horaires d'ouverture */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="text-gray-600 font-medium">Horaires d'ouverture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(DAYS_FR).map(([day, label]) => {
            const isOpen = !formData.openingHours[day]?.closed;
            return (
              <div key={day} 
                className={`p-3 rounded-2xl shadow-sm ${
                  isOpen 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-100' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-50/50 border border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={(e) => handleDayClosed(day, !e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer 
                      peer-focus:ring-2 peer-focus:ring-blue-500/20
                      peer-checked:after:translate-x-full peer-checked:bg-blue-500 
                      after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                      after:bg-white after:border after:rounded-full after:h-4 after:w-4 
                      after:transition-all duration-200">
                    </div>
                  </label>
                </div>

                {isOpen && (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="time"
                      value={formData.openingHours[day]?.open || '07:00'}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="flex-1 h-8 px-1 text-sm text-gray-600 bg-white/80 rounded-lg border border-gray-200 
                        hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10
                        placeholder-gray-400"
                    />
                    <span className="text-xs text-gray-400 px-0.5">à</span>
                    <input
                      type="time"
                      value={formData.openingHours[day]?.close || '22:00'}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="flex-1 h-8 px-1 text-sm text-gray-600 bg-white/80 rounded-lg border border-gray-200 
                        hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10
                        placeholder-gray-400"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InformationStep;
