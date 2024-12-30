import React, { useState } from 'react';
import { AlertCircle, Calendar, Clock, MoreVertical, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import InterventionForm from './InterventionForm';

interface TaskHistory {
  date: string;
  action: string;
  user: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  location: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  history: TaskHistory[];
  type: 'panne' | 'maintenance' | 'autre';
  timeElapsed: string;
}

const TasksList: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Données mockées (à remplacer par l'API)
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Terminal de paiement bloqué',
      description: 'Le terminal ne répond plus aux transactions',
      priority: 'high',
      location: 'Paris 11ème - Machine #123',
      createdAt: '2023-12-26T09:30:00',
      status: 'pending',
      type: 'panne',
      timeElapsed: '2h 15min',
      history: [
        {
          date: '2023-12-26T09:30:00',
          action: 'Signalement créé',
          user: 'Système'
        },
        {
          date: '2023-12-26T09:35:00',
          action: 'Notification envoyée',
          user: 'Système'
        }
      ]
    },
    {
      id: '2',
      title: 'Maintenance préventive',
      description: 'Vérification des filtres et courroies',
      priority: 'medium',
      location: 'Lyon Centre - Machine #45',
      createdAt: '2023-12-26T10:00:00',
      status: 'pending',
      type: 'maintenance',
      timeElapsed: '1h 45min',
      history: [
        {
          date: '2023-12-26T10:00:00',
          action: 'Tâche planifiée',
          user: 'Système'
        }
      ]
    }
  ];

  // Fonction pour déterminer la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Fonction pour marquer une tâche comme terminée
  const completeTask = (taskId: string) => {
    // Ici, appel API pour mettre à jour le statut
    console.log('Tâche terminée:', taskId);
    setSelectedTask(null);
  };

  // Fonction pour planifier une intervention
  const handleIntervention = (data: any) => {
    // Ici, appel API pour créer l'intervention
    console.log('Intervention planifiée:', data);
    setShowInterventionForm(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <h2 className="text-lg font-bold text-white">Tâches Prioritaires</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
          {tasks.length} tâches
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={"relative p-2 rounded-lg border " + getPriorityColor(task.priority)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-white text-sm">{task.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {task.timeElapsed}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {task.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(task)}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <MoreVertical className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal des actions */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Actions sur la tâche"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTask?.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{selectedTask?.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => completeTask(selectedTask?.id || '')}
              className="flex items-center gap-2 p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Marquer comme terminé</span>
            </button>

            <button
              onClick={() => {
                setSelectedTask(null);
                setShowHistoryModal(true);
              }}
              className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500/10 rounded-lg transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span>Voir l'historique</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal du formulaire d'intervention */}
      <Modal
        isOpen={showInterventionForm}
        onClose={() => setShowInterventionForm(false)}
        title="Planifier une intervention"
      >
        <InterventionForm
          onSubmit={handleIntervention}
          onCancel={() => setShowInterventionForm(false)}
        />
      </Modal>

      {/* Modal de l'historique */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Historique des actions"
      >
        <div className="space-y-4">
          {selectedTask?.history.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{item.user}</span>
                  <span className="text-sm text-gray-400">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TasksList;