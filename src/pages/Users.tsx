import React, { useState } from 'react';
import { Search, Plus, Mail, Phone, UserCircle } from 'lucide-react';
import { colors } from '../styles/colors';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'technician';
  status: 'active' | 'inactive';
  lastLogin: string;
}

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Données mockées pour l'exemple
  const users: User[] = [
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@wewash.fr',
      phone: '06 12 34 56 78',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-12-29T10:30:00'
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@wewash.fr',
      phone: '06 23 45 67 89',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-12-28T15:45:00'
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@wewash.fr',
      phone: '06 34 56 78 90',
      role: 'technician',
      status: 'inactive',
      lastLogin: '2024-12-25T09:15:00'
    }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-[#1E90FF]';
      case 'manager':
        return 'text-[#32CD32]';
      case 'technician':
        return 'text-[#9370DB]';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">Utilisateurs</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-grow sm:max-w-md">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white rounded-lg pl-10 pr-4 py-2 border border-[#1E90FF]/10 focus:border-[#1E90FF]/30 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Bouton Ajouter */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF] text-white rounded-lg hover:bg-[#1E90FF]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un utilisateur</span>
          </button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-[#1E1E1E] rounded-xl p-4 border border-[#1E90FF]/10 hover:border-[#1E90FF]/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1E90FF]/10 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-[#1E90FF]" />
              </div>

              <div className="flex-grow space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <span className={`text-sm ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Dernière connexion : {formatDate(user.lastLogin)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
