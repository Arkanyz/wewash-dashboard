import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

interface Incident {
  location: string;
  machineName: string;
  issue: string;
  time: string;
  severity: 'critical' | 'warning' | 'low';
}

const ActiveIncidents: React.FC = () => {
  const incidents: Incident[] = [
    {
      location: 'Paris 11ème',
      machineName: 'Machine #123',
      issue: 'Panne système',
      time: 'Il y a 2h',
      severity: 'critical'
    },
    {
      location: 'Lyon Centre',
      machineName: 'Sèche-linge #45',
      issue: 'Maintenance requise',
      time: 'Il y a 4h',
      severity: 'warning'
    },
    {
      location: 'Marseille',
      machineName: 'Machine #78',
      issue: 'Problème de chauffage',
      time: 'Il y a 6h',
      severity: 'warning'
    }
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-white">Incidents Actifs</h2>
        </div>
        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium">
          {incidents.length} incidents
        </span>
      </div>

      <div className="space-y-4 flex-grow">
        {incidents.map((incident, index) => (
          <div
            key={index}
            className={"relative p-4 rounded-lg border " + getSeverityStyles(incident.severity) + " transition-all duration-200 hover:scale-[1.02]"}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{incident.location}</h3>
                  <p className="text-lg font-bold text-white mt-1">{incident.machineName}</p>
                  <p className="text-gray-400 text-sm mt-1">{incident.issue}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{incident.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveIncidents;
