import React from 'react';
import { AlertCircle, Calendar, Clock, MoreVertical, CheckCircle } from 'lucide-react';

interface TaskHistory {
  date: string;
  action: string;
  user: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'normal';
  location: string;
  timeElapsed: string;
}

interface TasksListProps {
  tasks: Task[];
}

const TasksList: React.FC<TasksListProps> = ({ tasks }) => {
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
            className={"relative bg-white border border-gray-100 " + getPriorityColor(task.priority)}
          >
            {/* Version Mobile */}
            <div className="block sm:hidden">
              <div className="p-3">
                {/* En-tête avec priorité */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-red-600 font-medium flex items-center">
                    <span className="mr-1">●</span>
                    {task.priority === 'high' ? 'Urgent' : 'Modéré'}
                  </span>
                  <span className="text-[10px] text-[#666666] bg-[#F5F7FA] px-1.5 py-0.5 rounded">
                    Recommandé par l'assistant
                  </span>
                </div>

                {/* Titre et Description */}
                <h3 className="font-medium text-gray-900 mb-1">
                  {task.title}
                </h3>
                <p className="text-xs text-[#666666] mb-2">
                  {task.description}
                </p>

                {/* Infos en bas */}
                <div className="flex items-center text-xs text-[#666666] gap-3">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-blue-600" />
                    {task.timeElapsed}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1 text-blue-600" />
                    {task.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Version Desktop */}
            <div className="hidden sm:block p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-900 text-base">
                    {task.title}
                  </h3>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center text-red-600 font-medium text-xs">
                      <span className="mr-1">●</span>
                      {task.priority === 'high' ? 'Urgent' : 'Modéré'}
                    </span>
                    <span className="text-xs text-[#666666] bg-[#F5F7FA] px-2 py-1 rounded-md">
                      Recommandé<br />par l'assistant
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#666666]">
                  {task.description}
                </p>

                <div className="flex items-start gap-4">
                  <div className="flex items-center text-[#666666]">
                    <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                    <span className="text-sm">{task.timeElapsed}</span>
                  </div>
                  <div className="flex items-center text-[#666666]">
                    <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                    <span className="text-sm">{task.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-red-500';
    default:
      return 'border-orange-500';
  }
};

export default TasksList;