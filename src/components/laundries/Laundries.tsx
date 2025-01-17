import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import AddLaundryModal from './AddLaundryModal';

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
  const [newLaundry, setNewLaundry] = useState({ name: '', address: '', city: '', postal_code: '', contact_name: '', phone: '', email: '' });

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

  const handleAddLaundry = async (laundry: { name: string; address: string; city: string; postal_code: string; contact_name: string; phone: string; email: string }) => {
    try {
      const code = await generateNextCode();

      const { error } = await supabase
        .from('laundries')
        .insert([{ ...laundry, code, status: 'active', machines_count: 0 }]);

      if (error) throw error;

      fetchLaundries();
    } catch (error) {
      console.error('Error adding laundry:', error);
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Laveries</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#99E5DC] text-[#1E201F] rounded-lg hover:bg-[#7BC5BC] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une laverie
        </button>
      </div>

      <AddLaundryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLaundry}
      />

      <div className="grid gap-4">
        {laundries.map((laundry) => (
          <div
            key={laundry.id}
            className="bg-[#111313] rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[#99E5DC] font-mono">{laundry.code}</span>
                <h3 className="text-white font-medium">{laundry.name}</h3>
              </div>
              <p className="text-gray-400 mt-1">{laundry.address}</p>
              <p className="text-gray-400 mt-1">{laundry.city} {laundry.postal_code}</p>
              <p className="text-gray-400 mt-1">{laundry.contact_name} - {laundry.phone} - {laundry.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Pencil className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Laundries;
