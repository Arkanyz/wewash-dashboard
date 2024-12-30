import React from 'react';
import { Droplet, CreditCard, Lock, Thermometer } from 'lucide-react';

const RecentIncidents: React.FC = () => {
  const incidents = [
    {
      id: 1,
      icon: Droplet,
      problem: 'Fuite d\'eau importante',
      location: 'Lave-linge #L001',
      status: 'warning',
    },
    {
      id: 2,
      icon: CreditCard,
      problem: 'Terminal de paiement HS',
      location: 'Terminal #P001',
      status: 'info',
    },
    {
      id: 3,
      icon: Lock,
      problem: 'Porte bloquée',
      location: 'Sèche-linge #S001',
      status: 'error',
    },
    {
      id: 4,
      icon: Thermometer,
      problem: 'Problème de température',
      location: 'Sèche-linge #S002',
      status: 'warning',
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'warning':
        return 'bg-[#FFB020]/10 text-[#FFB020]';
      case 'error':
        return 'bg-[#D14343]/10 text-[#D14343]';
      case 'info':
        return 'bg-[#8EB7B2]/10 text-[#8EB7B2]';
      default:
        return 'bg-[#8EB7B2]/10 text-[#8EB7B2]';
    }
  };

  return (
    <div className="bg-[#314342] rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-white">Signalements Récents</h2>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div 
            key={incident.id} 
            className="bg-black/20 backdrop-blur-sm rounded-lg p-4 hover:bg-black/30 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${getStatusStyle(incident.status)} bg-opacity-20`}>
                <incident.icon className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-[#8EB7B2]">{incident.problem}</h3>
                <p className="text-[#8EB7B2]/60 text-sm mt-1">{incident.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentIncidents;
