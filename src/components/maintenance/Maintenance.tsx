import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter,
  ChevronDown,
  Search,
  ChevronRight,
  Settings,
  ClipboardList,
  History
} from 'lucide-react';

interface MaintenanceSection {
  id: string;
  label: string;
  icon: any;
}

const sections: MaintenanceSection[] = [
  { id: 'tasks', label: 'Tâches en cours', icon: Wrench },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'reports', label: 'Rapports', icon: ClipboardList },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

interface MaintenanceTask {
  id: string;
  machine_id: string;
  type: 'preventive' | 'corrective';
  status: 'pending' | 'scheduled' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  due_date: string;
  completed_date?: string;
  created_at: string;
  machine: {
    name: string;
    laundry: {
      name: string;
    };
  };
}

// Mock data for development
const mockTasks: MaintenanceTask[] = [
  {
    id: '1',
    machine_id: 'machine1',
    type: 'preventive',
    status: 'pending',
    priority: 'high',
    description: 'Nettoyage des filtres et vérification des joints',
    due_date: '2024-12-15',
    created_at: '2024-12-01',
    machine: {
      name: 'Machine à laver #1',
      laundry: {
        name: 'Laverie Paris 11'
      }
    }
  },
  {
    id: '2',
    machine_id: 'machine2',
    type: 'corrective',
    status: 'scheduled',
    priority: 'medium',
    description: 'Remplacement du joint de porte',
    due_date: '2024-12-20',
    created_at: '2024-12-02',
    machine: {
      name: 'Sèche-linge #2',
      laundry: {
        name: 'Laverie Lyon 6'
      }
    }
  },
  {
    id: '3',
    machine_id: 'machine3',
    type: 'preventive',
    status: 'completed',
    priority: 'low',
    description: 'Maintenance mensuelle standard',
    due_date: '2024-12-10',
    completed_date: '2024-12-09',
    created_at: '2024-12-01',
    machine: {
      name: 'Machine à laver #3',
      laundry: {
        name: 'Laverie Paris 11'
      }
    }
  }
];

const Maintenance: React.FC = () => {
  const [activeSection, setActiveSection] = useState('tasks');
  const [tasks, setTasks] = useState<MaintenanceTask[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.machine.laundry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'tasks':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Wrench className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Total des tâches</p>
                    <h3 className="text-2xl font-bold">{tasks.length}</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Tâches complétées</p>
                    <h3 className="text-2xl font-bold">
                      {tasks.filter(t => t.status === 'completed').length}
                    </h3>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Tâches en retard</p>
                    <h3 className="text-2xl font-bold">
                      {tasks.filter(t => t.status === 'pending').length}
                    </h3>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <button 
                  className="px-4 py-2 bg-gray-800 rounded-lg flex items-center gap-2"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  <Filter className="h-4 w-4" />
                  Filtrer
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showFilterMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4 z-10"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Statut</label>
                        <select
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">Tous</option>
                          <option value="completed">Complétés</option>
                          <option value="scheduled">Planifiés</option>
                          <option value="pending">En attente</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Priorité</label>
                        <select
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                        >
                          <option value="all">Toutes</option>
                          <option value="high">Haute</option>
                          <option value="medium">Moyenne</option>
                          <option value="low">Basse</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle tâche
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              <AnimatePresence>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Aucune tâche trouvée
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`} />
                          <div>
                            <h3 className="font-medium">{task.machine.name}</h3>
                            <p className="text-sm text-gray-400">
                              {task.machine.laundry.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </p>
                            <p className="text-sm text-gray-400">Priorité</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{new Date(task.due_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-400">Échéance</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{task.type}</p>
                            <p className="text-sm text-gray-400">Type</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-400">{task.description}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case 'planning':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Planning de maintenance</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle intervention
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="grid grid-cols-7 gap-4">
                {/* Calendar Header */}
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center text-gray-400 font-medium py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {Array.from({ length: 35 }).map((_, index) => (
                  <div
                    key={index}
                    className={`aspect-square p-2 rounded-lg ${
                      index === 15 ? 'bg-blue-600/20 border border-blue-600' : 'bg-gray-700'
                    } hover:bg-gray-600 transition-colors cursor-pointer`}
                  >
                    <div className="text-sm mb-1">{index + 1}</div>
                    {index === 15 && (
                      <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        2 interventions
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Maintenance */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Interventions à venir</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Wrench className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Maintenance préventive</h4>
                      <p className="text-sm text-gray-400">Machine à laver #1 - Laverie Paris 11</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">15 Déc 2024</p>
                    <p className="text-sm text-gray-400">14:00 - 16:00</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Wrench className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Remplacement filtre</h4>
                      <p className="text-sm text-gray-400">Sèche-linge #2 - Laverie Lyon 6</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">15 Déc 2024</p>
                    <p className="text-sm text-gray-400">16:30 - 17:30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Historique des maintenances</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <select className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                  <option value="all">Tous les types</option>
                  <option value="preventive">Préventive</option>
                  <option value="corrective">Corrective</option>
                </select>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Wrench className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Total interventions</p>
                    <h3 className="text-2xl font-bold">156</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Temps moyen</p>
                    <h3 className="text-2xl font-bold">1h 45m</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Taux de réussite</p>
                    <h3 className="text-2xl font-bold">98.5%</h3>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* History List */}
            <div className="bg-gray-800 rounded-lg">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 font-medium">
                <div>Date</div>
                <div>Machine</div>
                <div>Type</div>
                <div>Durée</div>
                <div>Statut</div>
              </div>
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors">
                  <div>01 Déc 2024</div>
                  <div>Machine à laver #1</div>
                  <div>
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-500 rounded-full text-sm">
                      Préventive
                    </span>
                  </div>
                  <div>1h 30m</div>
                  <div>
                    <span className="px-2 py-1 bg-green-600/20 text-green-500 rounded-full text-sm">
                      Terminé
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Rapports de maintenance</h2>
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  Dernier mois
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau rapport
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Interventions par type */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Interventions par type</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-400">Graphique circulaire ici</div>
                </div>
              </div>

              {/* Temps moyen par machine */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Temps moyen par machine</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-400">Graphique en barres ici</div>
                </div>
              </div>

              {/* Coûts de maintenance */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Coûts de maintenance</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-400">Graphique linéaire ici</div>
                </div>
              </div>

              {/* Taux de panne par laverie */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Taux de panne par laverie</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-400">Graphique en barres ici</div>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Rapports récents</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <ClipboardList className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Rapport mensuel - Novembre 2024</h4>
                        <p className="text-sm text-gray-400">Généré le 01 Déc 2024</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Planification */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Planification</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Intervalle de maintenance préventive</label>
                  <select className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option>Tous les mois</option>
                    <option>Tous les 2 mois</option>
                    <option>Tous les 3 mois</option>
                    <option>Tous les 6 mois</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Durée par défaut des interventions</label>
                  <select className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option>1 heure</option>
                    <option>2 heures</option>
                    <option>3 heures</option>
                    <option>4 heures</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Équipe de maintenance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">JD</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Jean Dupont</h4>
                      <p className="text-sm text-gray-400">Technicien principal</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                    Modifier
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">ML</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Marie Laurent</h4>
                      <p className="text-sm text-gray-400">Technicienne</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                    Modifier
                  </button>
                </div>

                <button className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un membre
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Maintenance</h2>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.label}</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {renderSectionContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Maintenance;
