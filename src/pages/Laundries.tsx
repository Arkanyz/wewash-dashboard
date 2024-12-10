import React, { useState } from 'react';
import { Plus, Search, MapPin, Phone } from 'lucide-react';
import AddLaundryModal, { LaundryData } from '../components/laundry/AddLaundryModal';

// Données d'exemple (à remplacer par les données réelles de votre API)
const mockLaundries = [
  {
    id: 1,
    name: 'Laverie Centrale',
    address: '15 rue de la République',
    city: 'Lyon',
    postalCode: '69001',
    contactName: 'Jean Dupont',
    phone: '06 12 34 56 78',
    email: 'contact@laveriecentrale.fr',
    machinesCount: 8,
    status: 'active',
  },
  // Ajoutez d'autres laveries d'exemple si nécessaire
];

const Laundries: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [laundries, setLaundries] = useState(mockLaundries);

  const handleAddLaundry = (laundryData: LaundryData) => {
    const newLaundry = {
      id: laundries.length + 1,
      ...laundryData,
      machinesCount: 0,
      status: 'active',
    };
    setLaundries([...laundries, newLaundry]);
  };

  const filteredLaundries = laundries.filter(laundry =>
    laundry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    laundry.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    laundry.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Laveries</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#99E5DC] text-black rounded-lg hover:bg-opacity-90"
        >
          <Plus size={20} />
          Ajouter une laverie
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher une laverie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#1F211F] border border-gray-700 rounded-lg focus:border-[#99E5DC] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLaundries.map(laundry => (
          <div
            key={laundry.id}
            className="bg-[#1A1C1A] p-6 rounded-lg border border-gray-700 hover:border-[#99E5DC] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{laundry.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 mt-1">
                  <MapPin size={16} />
                  <span className="text-sm">{laundry.address}, {laundry.city}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                laundry.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {laundry.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Phone size={16} />
                <span className="text-sm">{laundry.phone}</span>
              </div>
              <div className="text-sm text-gray-400">
                {laundry.machinesCount} machines
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button className="text-[#99E5DC] hover:text-[#7BC8C0] text-sm">
                Voir les détails
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddLaundryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLaundry}
      />
    </div>
  );
};

export default Laundries;
