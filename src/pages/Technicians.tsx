import React, { useState } from 'react';
import { Search, Plus, Calendar, MapPin, Phone, Mail, Filter, ChevronDown } from 'lucide-react';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  status: 'available' | 'busy' | 'offline';
  currentTask?: string;
  completedTasks: number;
  rating: number;
}

interface Task {
  id: string;
  title: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  dueDate: string;
}

const Technicians: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Données mockées pour l'exemple
  const technicians: Technician[] = [
    {
      id: '1',
      name: 'Thomas Martin',
      email: 'thomas.martin@wewash.fr',
      phone: '06 12 34 56 78',
      zone: 'Paris Nord',
      status: 'available',
      completedTasks: 128,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Sophie Dubois',
      email: 'sophie.dubois@wewash.fr',
      phone: '06 23 45 67 89',
      zone: 'Paris Sud',
      status: 'busy',
      currentTask: 'Réparation machine #M234',
      completedTasks: 95,
      rating: 4.9
    },
    {
      id: '3',
      name: 'Lucas Bernard',
      email: 'lucas.bernard@wewash.fr',
      phone: '06 34 56 78 90',
      zone: 'Paris Est',
      status: 'offline',
      completedTasks: 156,
      rating: 4.7
    }
  ];

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Maintenance préventive',
      location: 'Laverie Centrale - Paris 11',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-12-30'
    },
    {
      id: '2',
      title: 'Réparation machine #M234',
      location: 'Laverie Express - Paris 15',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: '2',
      dueDate: '2024-12-29'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-500';
      case 'busy':
        return 'bg-amber-500/10 text-amber-500';
      case 'offline':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500';
      case 'low':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredTechnicians = technicians.filter(tech => 
    (filterStatus === 'all' || tech.status === filterStatus) &&
    (tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tech.zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Techniciens</h1>
          <p className="text-gray-400 mt-1">Gérez vos techniciens et leurs interventions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-grow sm:max-w-md">
            <input
              type="text"
              placeholder="Rechercher un technicien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white rounded-lg pl-10 pr-4 py-2 border border-[#1E90FF]/10 focus:border-[#1E90FF]/30 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] text-white rounded-lg border border-[#1E90FF]/10 hover:border-[#1E90FF]/30">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Bouton Ajouter */}
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF] text-white rounded-lg hover:bg-[#1E90FF]/90">
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grille des techniciens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTechnicians.map((tech) => (
          <div
            key={tech.id}
            className="bg-[#1E1E1E] rounded-xl p-4 border border-[#1E90FF]/10 hover:border-[#1E90FF]/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1E90FF]/10 flex items-center justify-center">
                <span className="text-xl text-[#1E90FF]">
                  {tech.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{tech.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tech.status)}`}>
                      {tech.status === 'available' ? 'Disponible' : tech.status === 'busy' ? 'En intervention' : 'Hors ligne'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white">{tech.rating}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{tech.zone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{tech.email}</span>
                  </div>
                </div>

                {tech.currentTask && (
                  <div className="mt-4 p-3 bg-[#1E90FF]/5 rounded-lg">
                    <p className="text-sm text-[#1E90FF]">En cours : {tech.currentTask}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {tech.completedTasks} interventions réalisées
                  </span>
                  <button className="px-3 py-1 text-sm bg-[#1E90FF]/10 text-[#1E90FF] rounded-lg hover:bg-[#1E90FF]/20">
                    Voir le planning
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Liste des tâches en cours */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#1E90FF]/10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Interventions en cours</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF]/10 text-[#1E90FF] rounded-lg hover:bg-[#1E90FF]/20">
              <Calendar className="w-4 h-4" />
              <span>Planning</span>
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-[#1E90FF]/10 rounded-lg hover:border-[#1E90FF]/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{task.location}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Normal' : 'Faible'}
                  </span>
                </div>

                {task.assignedTo && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#1E90FF]/10 flex items-center justify-center">
                      <span className="text-xs text-[#1E90FF]">
                        {technicians.find(t => t.id === task.assignedTo)?.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {technicians.find(t => t.id === task.assignedTo)?.name}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Échéance : {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                  {!task.assignedTo && (
                    <button className="px-3 py-1 text-sm bg-[#1E90FF]/10 text-[#1E90FF] rounded-lg hover:bg-[#1E90FF]/20">
                      Assigner
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technicians;
