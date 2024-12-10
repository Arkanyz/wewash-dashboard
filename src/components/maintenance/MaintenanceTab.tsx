import React, { useState } from 'react';
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
  title: string;
  machine: string;
  laverie: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  description: string;
  assignedTo?: string;
}

const mockTasks: MaintenanceTask[] = [
  {
    id: 'MT-001',
    title: 'Nettoyage des filtres',
    machine: 'WM-01',
    laverie: 'Laverie Paris 11',
    dueDate: '2024-12-15',
    status: 'pending',
    priority: 'high',
    description: 'Nettoyage complet des filtres de la machine à laver',
    assignedTo: 'Jean Martin'
  },
  {
    id: 'MT-002',
    title: 'Vérification des joints',
    machine: 'WM-03',
    laverie: 'Laverie Lyon 6',
    dueDate: '2024-12-20',
    status: 'completed',
    priority: 'medium',
    description: 'Inspection et remplacement si nécessaire des joints de la porte'
  },
  {
    id: 'MT-003',
    title: 'Calibration',
    machine: 'WM-02',
    laverie: 'Laverie Paris 11',
    dueDate: '2024-12-10',
    status: 'overdue',
    priority: 'low',
    description: 'Calibration des capteurs de température et de niveau d\'eau'
  }
];

const MaintenanceTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState('tasks');
  const [tasks] = useState<MaintenanceTask[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'overdue':
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
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.laverie.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                      {tasks.filter(t => t.status === 'overdue').length}
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
                          <option value="pending">En attente</option>
                          <option value="overdue">En retard</option>
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
                {filteredTasks.map((task) => (
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
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-400">
                            {task.machine} - {task.laverie}
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
                          <p className="text-sm font-medium">{task.dueDate}</p>
                          <p className="text-sm text-gray-400">Échéance</p>
                        </div>
                        {task.assignedTo && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{task.assignedTo}</p>
                            <p className="text-sm text-gray-400">Assigné à</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-400">{task.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );

      case 'planning':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Planning de maintenance</h2>
            {/* Add planning content */}
          </div>
        );

      case 'history':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des maintenances</h2>
            {/* Add history content */}
          </div>
        );

      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Rapports de maintenance</h2>
            {/* Add reports content */}
          </div>
        );

      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Paramètres de maintenance</h2>
            {/* Add settings content */}
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

export default MaintenanceTab;
