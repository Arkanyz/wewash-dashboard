import React from "react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "../ui/button";
import TasksList from "./TasksList";

interface Task {
  id: number;
  title: string;
  location: string;
  description: string;
  priority: "high" | "normal";
  timeElapsed: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Terminal de paiement bloqué",
    location: "Paris 11ème - Machine #123",
    description: "Le terminal ne répond plus aux transactions",
    priority: "high",
    timeElapsed: "2h 15min",
  },
  {
    id: 2,
    title: "Maintenance préventive",
    location: "Lyon Centre - Machine #45",
    description: "Vérification des filtres et courroies",
    priority: "normal",
    timeElapsed: "1h 45min",
  },
];

const TasksOverview = () => {
  const stats = {
    appels: 42,
    tempsMoyen: "8 min",
    resolution: "94%",
    enAttente: 3,
  };

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Tâches & Actions préventives
        </h2>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        >
          <IconPlus className="h-4 w-4" />
          <span>Nouvelle tâche</span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <IconClock className="h-4 w-4" />
            <span>Appels</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.appels}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <IconHourglass className="h-4 w-4" />
            <span>Temps moyen</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.tempsMoyen}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <IconCheck className="h-4 w-4" />
            <span>Résolution</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.resolution}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <IconClock className="h-4 w-4" />
            <span>En attente</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.enAttente}
          </p>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Tâches Prioritaires</h2>
          <span className="text-sm text-gray-500">2 tâches</span>
        </div>
        <TasksList tasks={tasks} />
      </div>
    </div>
  );
};

export default TasksOverview;
