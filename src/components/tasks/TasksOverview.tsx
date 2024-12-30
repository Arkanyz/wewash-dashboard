import React from "react";
import { IconPlus, IconClock, IconCheck, IconHourglass, IconChevronRight } from "@tabler/icons-react";
import { Button } from "../ui/button";

interface Task {
  id: number;
  title: string;
  location: string;
  description: string;
  status: "urgent" | "normal";
  date: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Fuite centrale - Laverie Paris 11",
    location: "Paris 11",
    description: "Intervention d'urgence nécessaire pour réparer une fuite d'eau",
    status: "urgent",
    date: "15:54",
  },
  {
    id: 2,
    title: "Maintenance préventive - Sèche-linge",
    location: "Lyon",
    description: "Inspection manuelle des électroniques",
    status: "normal",
    date: "Aujourd'hui",
  },
  {
    id: 3,
    title: "Panne système de paiement",
    location: "Paris 15",
    description: "Terminal de paiement hors service",
    status: "normal",
    date: "Aujourd'hui",
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
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center justify-between p-4 rounded-xl 
                     bg-gray-50 dark:bg-[#1d1d1f] hover:bg-gray-100 dark:hover:bg-[#202022] 
                     transition-colors duration-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {task.title}
                </h3>
                {task.status === "urgent" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Urgent
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                {task.description}
              </p>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.location}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {task.date}
                </div>
              </div>
              <IconChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksOverview;
