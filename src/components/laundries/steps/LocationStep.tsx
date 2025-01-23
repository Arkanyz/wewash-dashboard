import React, { useState, useCallback } from 'react';
import { MapPin, Clock, Locate } from 'lucide-react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { Switch } from '@/components/ui/Switch';

interface LocationStepProps {
  formData: any;
  onChange: (data: any) => void;
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

export const LocationStep: React.FC<LocationStepProps> = ({ formData, onChange }) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autocomplete);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        // Mettre à jour la carte
        map?.panTo({ lat, lng });
        map?.setZoom(17);
        
        // Mettre à jour le marker
        if (marker) {
          marker.setPosition({ lat, lng });
        } else {
          const newMarker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: place.name
          });
          setMarker(newMarker);
        }

        // Extraire les composants de l'adresse
        let streetNumber = '';
        let route = '';
        let city = '';
        let postalCode = '';

        place.address_components?.forEach(component => {
          const types = component.types;
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (types.includes('route')) {
            route = component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });

        onChange({
          ...formData,
          location: {
            address: `${streetNumber} ${route}`.trim(),
            city,
            postalCode,
            lat,
            lng
          }
        });
      }
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          map?.panTo({ lat, lng });
          map?.setZoom(17);

          if (marker) {
            marker.setPosition({ lat, lng });
          } else {
            const newMarker = new google.maps.Marker({
              position: { lat, lng },
              map,
              title: 'Votre position'
            });
            setMarker(newMarker);
          }

          // Reverse geocoding pour obtenir l'adresse
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const place = results[0];
              let streetNumber = '';
              let route = '';
              let city = '';
              let postalCode = '';

              place.address_components?.forEach(component => {
                const types = component.types;
                if (types.includes('street_number')) {
                  streetNumber = component.long_name;
                }
                if (types.includes('route')) {
                  route = component.long_name;
                }
                if (types.includes('locality')) {
                  city = component.long_name;
                }
                if (types.includes('postal_code')) {
                  postalCode = component.long_name;
                }
              });

              onChange({
                ...formData,
                location: {
                  address: `${streetNumber} ${route}`.trim(),
                  city,
                  postalCode,
                  lat,
                  lng
                }
              });
            }
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    onChange({
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
    onChange({
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
      {/* Recherche d'adresse */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Localisation</h3>
          <button
            onClick={handleGeolocation}
            className="flex items-center px-3 py-1.5 text-sm text-[#286BD4] hover:bg-[#286BD4]/5 rounded-lg"
          >
            <Locate className="w-4 h-4 mr-2" />
            Me localiser
          </button>
        </div>
        
        <div className="relative">
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            restrictions={{ country: 'fr' }}
          >
            <input
              type="text"
              placeholder="Rechercher une adresse..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:border-[#286BD4] focus:ring-2 focus:ring-[#286BD4]/10 transition-all duration-200"
            />
          </Autocomplete>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <div className="h-[200px] rounded-lg overflow-hidden">
          <GoogleMap
            onLoad={setMap}
            center={{ lat: 46.603354, lng: 1.888334 }} // Centre de la France
            zoom={6}
            mapContainerStyle={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-[#286BD4]" />
          Horaires d'ouverture
        </h3>

        <div className="grid gap-4">
          {Object.entries(DAYS_FR).map(([day, label]) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-32">
                <span className="text-sm text-gray-700">{label}</span>
              </div>
              <Switch
                checked={!formData.openingHours[day]?.closed}
                onCheckedChange={(checked) => handleDayClosed(day, !checked)}
              />
              {!formData.openingHours[day]?.closed && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={formData.openingHours[day]?.open || '07:00'}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="px-2 py-1.5 rounded-md border border-gray-200 text-sm"
                  />
                  <span className="text-gray-500">à</span>
                  <input
                    type="time"
                    value={formData.openingHours[day]?.close || '22:00'}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="px-2 py-1.5 rounded-md border border-gray-200 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
