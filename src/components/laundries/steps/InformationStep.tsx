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

export const InformationStep: React.FC<InformationStepProps> = ({ formData, setFormData }) => {
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
        <div className="flex items-center gap-2 text-blue-500 mb-6">
          <MapPin className="w-5 h-5" />
          <h2 className="text-base font-medium">Informations de base</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Nom de la laverie
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-gray-600 placeholder-gray-400
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              placeholder="Ma laverie"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-gray-600 placeholder-gray-400
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              placeholder="123 rue de la Laverie"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-gray-600 placeholder-gray-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                placeholder="75000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-gray-600 placeholder-gray-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                placeholder="Paris"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section des horaires d'ouverture */}
      <div>
        <div className="flex items-center gap-2 text-blue-500 mb-6">
          <Clock className="w-5 h-5" />
          <h2 className="text-base font-medium">Horaires d'ouverture</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(DAYS_FR).map(([day, label]) => {
            const isOpen = !formData.openingHours[day]?.closed;
            return (
              <div key={day} 
                className={`relative p-4 rounded-2xl transition-all duration-200 ${
                  isOpen ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={(e) => handleDayClosed(day, !e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer 
                      peer-checked:after:translate-x-full peer-checked:bg-blue-500 
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                      after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all">
                    </div>
                  </label>
                </div>

                {isOpen && (
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <input
                        type="time"
                        value={formData.openingHours[day]?.open || '07:00'}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-white rounded-lg border border-gray-200 
                          focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                      />
                    </div>
                    <span className="text-xs text-gray-400 px-0.5">à</span>
                    <div className="relative flex-1">
                      <input
                        type="time"
                        value={formData.openingHours[day]?.close || '22:00'}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-white rounded-lg border border-gray-200 
                          focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                      />
                    </div>
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
