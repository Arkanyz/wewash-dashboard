import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { useSupabase } from '../providers/SupabaseProvider';
import AddLaundryModal from '../components/laundries/AddLaundryModal';
import { colors } from '../styles/colors';

interface Laundry {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  contact_name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  machines_count: number;
  created_at: string;
  updated_at: string;
}

const Laundries: React.FC = () => {
  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchLaundries();
  }, []);

  const fetchLaundries = async () => {
    try {
      const { data, error } = await supabase
        .from('laundries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLaundries(data || []);
    } catch (error) {
      console.error('Error fetching laundries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLaundries = laundries.filter(laundry => 
    laundry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    laundry.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    laundry.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLaundry = async (laundry: Omit<Laundry, 'id' | 'code' | 'status' | 'machines_count' | 'created_at' | 'updated_at'>) => {
    try {
      const code = await generateNextCode();
      const { error } = await supabase
        .from('laundries')
        .insert([{ ...laundry, code, status: 'active', machines_count: 0 }]);

      if (error) throw error;
      fetchLaundries();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding laundry:', error);
    }
  };

  const generateNextCode = async () => {
    try {
      const { data, error } = await supabase
        .from('laundries')
        .select('code')
        .order('code', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        const lastCode = data[0].code;
        const lastNumber = parseInt(lastCode.split('-')[1]);
        return `WT-${String(lastNumber + 1).padStart(3, '0')}`;
      }
      return 'WT-001';
    } catch (error) {
      console.error('Error generating code:', error);
      return 'WT-001';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E90FF]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">Laveries</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-grow sm:max-w-md">
            <input
              type="text"
              placeholder="Rechercher une laverie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white rounded-lg pl-10 pr-4 py-2 border border-[#1E90FF]/10 focus:border-[#1E90FF]/30 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF] text-white rounded-lg hover:bg-[#1E90FF]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une laverie</span>
          </button>
        </div>
      </div>

      {/* Liste des laveries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLaundries.map((laundry) => (
          <div
            key={laundry.id}
            className="bg-[#1E1E1E] rounded-xl p-4 border border-[#1E90FF]/10 hover:border-[#1E90FF]/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{laundry.name}</h3>
                <p className="text-sm text-gray-400">{laundry.code}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#1E90FF]/10 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4 text-[#1E90FF]" />
                </button>
                <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                {laundry.address}, {laundry.postal_code} {laundry.city}
              </p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  laundry.status === 'active' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {laundry.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-400">
                  {laundry.machines_count} machine{laundry.machines_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout */}
      <AddLaundryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLaundry}
      />
    </div>
  );
};

export default Laundries;
