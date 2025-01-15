import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LaundryIssue {
  id: number;
  name: string;
  lat: number;
  lng: number;
  issueCount: number;
  severity: 'low' | 'medium' | 'high';
}

interface LaundryIssuesMapProps {
  laundries: LaundryIssue[];
}

const getSeverityColor = (severity: LaundryIssue['severity']) => {
  switch (severity) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

const LaundryIssuesMap: React.FC<LaundryIssuesMapProps> = ({ laundries }) => {
  const center: [number, number] = [48.8566, 2.3522]; // Paris center coordinates

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {laundries.map((laundry) => (
          <Marker
            key={laundry.id}
            position={[laundry.lat, laundry.lng]}
            icon={L.divIcon({
              className: `marker-icon ${getSeverityColor(laundry.severity)}`,
              html: `<div class="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs font-bold">
                      ${laundry.issueCount}
                    </div>`,
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{laundry.name}</h3>
                <p className="text-sm">
                  Problèmes signalés : {laundry.issueCount}
                </p>
                <p className={`text-sm ${getSeverityColor(laundry.severity)}`}>
                  Sévérité : {laundry.severity}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LaundryIssuesMap;
