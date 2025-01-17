import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, Trash2, AlertCircle, CheckCircle, Clock, X, MapPin, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddLaundryModal from '../components/laundries/AddLaundryModal';
import AddMachineModal, { MachineData } from '../components/machines/AddMachineModal';
import type { LaundryData } from '../components/laundries/AddLaundryModal';
import ErrorModal from '../components/modals/ErrorModal';

interface Machine {
  id: string;
  laundry_id: string;
  machine_type: string;
  machine_number: string;
  machine_status: string;
  created_at: string;
}

interface Laundry {
  id: string;
  name: string;
  address: string;
  ville: string;  // Nom exact de la colonne dans la base de données
  code_postal: string;  // Nom exact de la colonne dans la base de données
  machines: Machine[];
  lastUpdate?: string;
}

const getGlobalStatus = (machines: Machine[]) => {
  if (!machines.length) return 'ok';
  if (machines.some(m => m.machine_status === 'out_of_order')) return 'error';
  if (machines.some(m => m.machine_status === 'maintenance')) return 'maintenance';
  return 'ok';
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'error':
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    case 'maintenance':
      return <Clock className="w-6 h-6 text-orange-500" />;
    default:
      return <CheckCircle className="w-6 h-6 text-emerald-500" />;
  }
};

const StatusMessage = ({ status }: { status: string }) => {
  switch (status) {
    case 'error':
      return <span className="text-red-500">Problème détecté</span>;
    case 'maintenance':
      return <span className="text-orange-500">Maintenance en cours</span>;
    default:
      return <span className="text-emerald-500">Aucune alerte à signaler</span>;
  }
};

const Laundries: React.FC = () => {
  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [error, setError] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  useEffect(() => {
    fetchLaundries();

    // Mettre en place l'écoute des changements sur temp_machines
    const machinesSubscription = supabase
      .channel('machine-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'temp_machines'
        },
        (payload) => {
          console.log('Changement détecté dans les machines:', payload);
          // Recharger les données pour mettre à jour l'interface
          fetchLaundries();
        }
      )
      .subscribe();

    // Nettoyage lors du démontage du composant
    return () => {
      machinesSubscription.unsubscribe();
    };
  }, []);

  const fetchLaundries = async () => {
    try {
      setLoading(true);
      const { data: laundriesData, error: laundriesError } = await supabase
        .from('laundries')
        .select('*')
        .order('created_at', { ascending: false });

      if (laundriesError) throw laundriesError;

      console.log('Laveries récupérées:', laundriesData);

      const processedLaundries = await Promise.all(
        laundriesData.map(async (laundry) => {
          const { data: machinesData, error: machinesError } = await supabase
            .from('temp_machines')
            .select('*')
            .eq('laundry_id', laundry.id);

          if (machinesError) {
            console.error('Erreur lors de la récupération des machines:', machinesError);
            throw machinesError;
          }

          console.log(`Machines pour la laverie ${laundry.id}:`, machinesData);

          return {
            ...laundry,
            machines: machinesData || []
          };
        })
      );

      console.log('Laveries traitées:', processedLaundries);
      setLaundries(processedLaundries);
    } catch (error) {
      console.error('Erreur lors du chargement des laveries:', error);
      setError({
        isOpen: true,
        message: 'Erreur lors du chargement des laveries'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLaundry = async (laundryData: LaundryData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Vous devez être connecté pour ajouter une laverie');
        return;
      }

      // Créer l'objet à insérer avec les noms exacts des colonnes
      const newLaundry = {
        name: laundryData.name,
        address: laundryData.address,
        ville: laundryData.city,
        code_postal: laundryData.postal_code,
        owner_id: user.id
      };

      console.log('Tentative d\'ajout de laverie avec les données:', newLaundry);

      const { data, error } = await supabase
        .from('laundries')
        .insert(newLaundry)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Aucune donnée retournée après l\'insertion');
      }

      console.log('Laverie ajoutée avec succès:', data);

      // Ajouter la nouvelle laverie à l'état local
      setLaundries(prev => [...prev, { ...data, machines: [] }]);
      setIsAddModalOpen(false);
      
      // Recharger les données pour être sûr d'avoir les dernières informations
      fetchLaundries();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la laverie:', err);
      alert(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'ajout de la laverie');
    }
  };

  const handleDeleteLaundry = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette laverie ?')) {
      try {
        const { error } = await supabase
          .from('laundries')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setLaundries(laundries.filter(laundry => laundry.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression de la laverie:', err);
        alert('Erreur lors de la suppression de la laverie. Veuillez réessayer.');
      }
    }
  };

  const handleLaundryClick = (laundry: Laundry) => {
    setSelectedLaundry(laundry);
  };

  const handleAddMachine = async (machineData: MachineData) => {
    if (!selectedLaundry) return;

    try {
      console.log('Début ajout machine avec données:', machineData);

      const { data: existingMachines } = await supabase
        .from('temp_machines')
        .select('machine_number, machine_type')
        .eq('laundry_id', selectedLaundry.id)
        .eq('machine_type', machineData.type)
        .order('machine_number', { ascending: false });

      console.log('Machines existantes:', existingMachines);

      const lastNumber = existingMachines?.length 
        ? Math.max(...existingMachines.map(m => {
            const match = m.machine_number.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
          }))
        : 0;

      console.log('Dernier numéro trouvé:', lastNumber);

      const machines = Array.from({ length: machineData.quantity }, (_, index) => {
        const number = lastNumber + index + 1;
        const machineNumber = machineData.type === 'washer' 
          ? `Machine ${number}`
          : machineData.type === 'dryer'
            ? `Sèche-linge ${number}`
            : `Borne ${number}`;
        
        return {
          laundry_id: selectedLaundry.id,
          machine_type: machineData.type,
          machine_number: machineNumber,
          machine_status: 'ok'
        };
      });

      console.log('Machines à ajouter:', machines);

      const { data, error } = await supabase
        .from('temp_machines')
        .insert(machines)
        .select();

      if (error) {
        console.error('Erreur lors de l\'insertion:', error);
        throw error;
      }

      console.log('Machines ajoutées avec succès:', data);

      // Recharger toutes les données
      await fetchLaundries();
      
      setIsAddMachineModalOpen(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout des machines:', err);
      setError({
        isOpen: true,
        message: 'Une erreur est survenue lors de l\'ajout des machines. Veuillez réessayer.'
      });
    }
  };

  useEffect(() => {
    const debugMachineStructure = async () => {
      const { data, error } = await supabase
        .from('temp_machines')
        .select('*')
        .limit(1);
      
      if (data && data.length > 0) {
        console.log('Structure d\'une machine existante:', data[0]);
      } else if (error) {
        console.error('Erreur lors de la récupération de la structure:', error);
      }
    };

    debugMachineStructure();
  }, []);

  const filteredLaundries = laundries.filter(laundry => 
    laundry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    laundry.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
    laundry.code_postal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LaundryCard = ({ laundry }: { laundry: Laundry }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const activeMachines = laundry.machines.filter(m => m.machine_status === 'ok').length;
    const totalMachines = laundry.machines.length;
    const status = getGlobalStatus(laundry.machines);

    const handleDelete = () => {
      setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
      handleDeleteLaundry(laundry.id);
      setShowDeleteConfirm(false);
    };

    return (
      <div className="bg-white rounded-[20px] p-6">
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la laverie "{laundry.name}" ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-50 text-gray-600 rounded-3xl hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-3xl hover:bg-red-100 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#286BD4] text-lg font-medium mb-2">{laundry.name}</h3>
              <div className="flex items-center text-gray-500 mb-1">
                <MapPin className="w-4 h-4 text-[#286BD4] mr-2 flex-shrink-0" />
                {laundry.address}
              </div>
              <div className="text-gray-500 ml-6">
                {laundry.ville}, {laundry.code_postal}
              </div>
            </div>

            <div className="flex gap-1">
              <button 
                onClick={() => handleLaundryClick(laundry)}
                className="p-2 bg-blue-50 text-[#286BD4] hover:bg-blue-100 rounded-3xl transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 bg-blue-50 text-[#286BD4] hover:bg-blue-100 rounded-3xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Machines actives</span>
              <span className="text-[#286BD4]">{activeMachines}/{totalMachines}</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full">
              <div 
                className="h-full bg-[#286BD4] rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((activeMachines / totalMachines) * 100), 100)}%`
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'error' ? 'bg-red-400' :
                status === 'maintenance' ? 'bg-amber-400' :
                'bg-emerald-400'
              }`} />
              <span className="text-gray-600">
                {status === 'error' ? 'Problème détecté' :
                 status === 'maintenance' ? 'Maintenance en cours' :
                 'Tout fonctionne'}
              </span>
            </div>

            <button 
              onClick={() => handleLaundryClick(laundry)}
              className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-3xl transition-colors"
            >
              <span className="text-[#286BD4] font-medium">Détails</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-semibold text-[#286BD4]">Laveries</h1>
          <p className="text-[#286BD4]/60 mt-1">
            Gérez vos laveries et leurs équipements
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#286BD4] text-white rounded-3xl hover:bg-[#1E5BB7] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une laverie
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une laverie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-3xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
          />
        </div>
      </div>

      {/* Liste des laveries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>Chargement...</div>
        ) : filteredLaundries.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Aucune laverie trouvée
          </div>
        ) : (
          filteredLaundries.map((laundry) => (
            <LaundryCard key={laundry.id} laundry={laundry} />
          ))
        )}
      </div>

      {/* Modal d'ajout de laverie */}
      <AddLaundryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLaundry}
      />

      {/* Modal d'ajout de machines */}
      {selectedLaundry && (
        <AddMachineModal
          isOpen={isAddMachineModalOpen}
          onClose={() => setIsAddMachineModalOpen(false)}
          onSubmit={handleAddMachine}
          laundryId={selectedLaundry.id}
        />
      )}
      {/* Modal de détails de la laverie */}
      {selectedLaundry && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl m-4 overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
          >
            {/* En-tête avec dégradé */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#286BD4] to-[#1E5BB7] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {selectedLaundry.name}
                  </h2>
                  <p className="text-white/80 mt-1">
                    {selectedLaundry.address}, {selectedLaundry.ville} {selectedLaundry.code_postal}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLaundry(null)}
                  className="p-2 rounded-3xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Stats en haut */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-6 rounded-3xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Total Machines</h4>
                  <p className="text-2xl font-semibold text-gray-900">{selectedLaundry.machines.length}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Machines Actives</h4>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {selectedLaundry.machines.filter(m => m.machine_status === 'ok').length}
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">En Maintenance</h4>
                  <p className="text-2xl font-semibold text-orange-500">
                    {selectedLaundry.machines.filter(m => m.machine_status === 'maintenance').length}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Équipements
                </h3>
                <button
                  onClick={() => setIsAddMachineModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-[#286BD4] text-white rounded-3xl hover:bg-[#1E5BB7] transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter des équipements
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedLaundry.machines.map((machine) => (
                  <motion.div
                    key={machine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-lg font-medium text-gray-900">
                          {machine.machine_number}
                        </span>
                      </div>
                      <StatusIcon status={machine.machine_status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <ErrorModal 
        isOpen={error.isOpen}
        onClose={() => setError({ isOpen: false, message: '' })}
        message={error.message}
      />
    </div>
  );
};

export default Laundries;
