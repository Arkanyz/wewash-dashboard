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
import { useMaintenanceSystem } from '../../hooks/useMaintenanceSystem';

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

const Maintenance: React.FC = () => {
  const [activeSection, setActiveSection] = useState('tasks');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    tasks,
    technicians,
    loading,
    error,
    createTask,
    updateTaskStatus,
    assignTask,
    createIntervention
  } = useMaintenanceSystem();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <AlertTriangle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      // Afficher une notification de succès
    } catch (err) {
      // Gérer l'erreur
      console.error('Erreur lors de la création de la tâche:', err);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: any) => {
    try {
      await updateTaskStatus(taskId, status);
      // Afficher une notification de succès
    } catch (err) {
      // Gérer l'erreur
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const handleAssignTask = async (taskId: string, technicianId: string) => {
    try {
      await assignTask(taskId, technicianId);
      // Afficher une notification de succès
    } catch (err) {
      // Gérer l'erreur
      console.error('Erreur lors de l\'attribution de la tâche:', err);
    }
  };

  return (
    <div className="h-full bg-[#121212] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <button
          onClick={() => handleCreateTask({
            title: 'Nouvelle tâche',
            description: 'Description de la tâche',
            priority: 'medium',
            status: 'pending'
          })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle tâche
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 bg-[#1A1D1D] rounded-lg p-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center p-3 rounded-lg mb-2 ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-[#2A2D2D] text-gray-300'
              }`}
            >
              <section.icon className="w-5 h-5 mr-3" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="col-span-9 bg-[#1A1D1D] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2A2D2D] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4 p-2 hover:bg-[#2A2D2D] rounded-lg"
            >
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#2A2D2D] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#2A2D2D] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          )}

          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#2A2D2D] rounded-lg p-4 hover:bg-[#3A3D3D] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        task.priority === 'high'
                          ? 'bg-red-500/20 text-red-500'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-green-500/20 text-green-500'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      className="bg-[#1A1D1D] text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminé</option>
                    </select>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{task.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <select
                    onChange={(e) => handleAssignTask(task.id, e.target.value)}
                    className="bg-[#1A1D1D] text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Assigner à un technicien</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.specialization}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
