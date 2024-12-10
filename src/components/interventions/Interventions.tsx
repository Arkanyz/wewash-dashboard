import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Mail, Phone, Loader2 } from 'lucide-react';
import { useSupabase } from '../../providers/SupabaseProvider';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddTechnicianModal from '../technicians/AddTechnicianModal';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  availability: 'available' | 'busy' | 'unavailable';
}

interface Intervention {
  id: string;
  technician_id: string;
  laundry_id: string;
  machine_id: string;
  scheduled_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  description: string;
}

const Interventions: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddTechnicianModalOpen, setIsAddTechnicianModalOpen] = useState(false);
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Charger les techniciens
      const { data: techData, error: techError } = await supabase
        .from('technicians')
        .select('*')
        .order('name');

      if (techError) throw techError;
      setTechnicians(techData || []);

      // Charger les interventions
      const { data: intData, error: intError } = await supabase
        .from('interventions')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (intError) throw intError;
      setInterventions(intData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTechnician = async (technicianData: any) => {
    try {
      const { error } = await supabase
        .from('technicians')
        .insert([{ ...technicianData, availability: 'available' }]);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error adding technician:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#99E5DC]" />
      </div>
    );
  }

  return (
    <div className="bg-[#111313] p-6 rounded-xl h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Interventions</h1>
        <button
          onClick={() => setIsAddTechnicianModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#99E5DC] text-[#1E201F] rounded-lg hover:bg-[#7BC5BC] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un technicien
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Liste des techniciens */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Techniciens</h2>
          <div className="grid gap-4">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="bg-[#1E201F] rounded-xl p-4 hover:bg-[#252725] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{tech.name}</h3>
                    <p className="text-sm text-gray-400">{tech.speciality}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      tech.availability === 'available' ? 'bg-green-900/50 text-green-500' :
                      tech.availability === 'busy' ? 'bg-yellow-900/50 text-yellow-500' :
                      'bg-red-900/50 text-red-500'
                    }`}
                  >
                    {tech.availability === 'available' ? 'Disponible' :
                     tech.availability === 'busy' ? 'Occupé' :
                     'Indisponible'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {tech.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {tech.phone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interventions planifiées */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Interventions planifiées</h2>
          <div className="grid gap-4">
            {interventions.map((intervention) => (
              <div
                key={intervention.id}
                className="bg-[#1E201F] rounded-xl p-4 hover:bg-[#252725] transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-[#99E5DC]" />
                  <span className="text-white">
                    {format(parseISO(intervention.scheduled_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Machine {intervention.machine_id}</p>
                    <p className="text-sm text-gray-400">{intervention.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      intervention.status === 'pending' ? 'bg-yellow-900/50 text-yellow-500' :
                      intervention.status === 'confirmed' ? 'bg-blue-900/50 text-blue-500' :
                      intervention.status === 'completed' ? 'bg-green-900/50 text-green-500' :
                      'bg-red-900/50 text-red-500'
                    }`}
                  >
                    {intervention.status === 'pending' ? 'En attente' :
                     intervention.status === 'confirmed' ? 'Confirmé' :
                     intervention.status === 'completed' ? 'Terminé' :
                     'Annulé'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddTechnicianModal
        isOpen={isAddTechnicianModalOpen}
        onClose={() => setIsAddTechnicianModalOpen(false)}
        onSubmit={handleAddTechnician}
      />
    </div>
  );
};

export default Interventions;
