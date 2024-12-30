import React, { useState, useEffect } from 'react';
import TasksOverview from '../tasks/TasksOverview';
import WeLineWidget from '../weline/WeLineWidget';
import { Droplet, CreditCard, Lock, Thermometer, MoreHorizontal } from 'lucide-react';
import { useSupabase } from '../../providers/SupabaseProvider';
import { useNavigate } from 'react-router-dom';

interface Incident {
  id: number;
  icon: any;
  problem: string;
  location: string;
  machine: string;
  date: string;
  status: 'en-cours' | 'traite' | 'non-resolu';
  statusText: string;
  action: string;
}

const mockIncidents: Incident[] = [
  {
    id: 1,
    icon: Droplet,
    problem: 'Fuite d\'eau importante',
    location: 'Laverie Centrale',
    machine: 'Lave-linge #L001',
    date: '15 janvier 2024',
    status: 'en-cours',
    statusText: 'En cours',
    action: 'Intervention programmée',
  },
  {
    id: 2,
    icon: CreditCard,
    problem: 'Terminal de paiement HS',
    location: 'Laverie Express',
    machine: 'Terminal #P001',
    date: '15 janvier 2024',
    status: 'traite',
    statusText: 'Traité',
    action: 'Résolu par IA',
  },
  {
    id: 3,
    icon: Lock,
    problem: 'Porte bloquée',
    location: 'Laverie du Marais',
    machine: 'Sèche-linge #S001',
    date: '15 janvier 2024',
    status: 'non-resolu',
    statusText: 'Non résolu',
    action: 'En attente d\'analyse',
  },
  {
    id: 4,
    icon: Thermometer,
    problem: 'Problème de température',
    location: 'Laverie Saint-Michel',
    machine: 'Sèche-linge #S002',
    date: '15 janvier 2024',
    status: 'en-cours',
    statusText: 'En cours',
    action: 'Technicien en route',
  },
];

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIncidents(mockIncidents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    navigate('/signalements', { state: { selectedIncident: incident } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en-cours':
        return 'bg-yellow-500';
      case 'traite':
        return 'bg-green-500';
      case 'non-resolu':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#99E5DC]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TasksOverview />
        <WeLineWidget />
      </div>
      
      <div className="bg-[#111313] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Signalements Récents</h2>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-white flex items-center gap-2">
              Filtrer
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-4 text-sm text-gray-400 pb-2">
            <div>PROBLÉMATIQUE</div>
            <div>LOCALISATION</div>
            <div>STATUT</div>
            <div>ACTION</div>
          </div>

          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="grid grid-cols-4 items-center bg-[#1A1D1D] p-4 rounded-lg cursor-pointer hover:bg-[#222525] transition-colors"
              onClick={() => handleIncidentClick(incident)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(incident.status)} bg-opacity-10`}>
                  <incident.icon className={`w-5 h-5 ${getStatusColor(incident.status)} text-opacity-100`} />
                </div>
                <div>
                  <p className="font-medium text-white">{incident.problem}</p>
                  <p className="text-sm text-gray-400">{incident.machine}</p>
                </div>
              </div>

              <div>
                <p className="text-white">{incident.location}</p>
                <p className="text-sm text-gray-400">{incident.date}</p>
              </div>

              <div className="relative">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    incident.status === 'en-cours'
                      ? 'bg-yellow-500 bg-opacity-10 text-yellow-500'
                      : incident.status === 'traite'
                      ? 'bg-green-500 bg-opacity-10 text-green-500'
                      : 'bg-red-500 bg-opacity-10 text-red-500'
                  }`}
                >
                  {incident.statusText}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">{incident.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
