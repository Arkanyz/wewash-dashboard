import React from 'react';
import WeLineWidget from '../components/weline/WeLineWidget';
import ActiveIncidents from '../components/incidents/ActiveIncidents';
import StrategicRecommendations from '../components/recommendations/StrategicRecommendations';
import AIAssistant from '../components/ai/AIAssistant';
import TasksList from '../components/tasks/TasksList'; // Votre composant existant de tâches

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#2B2B2B] text-white p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4 md:space-y-6">
        {/* Stats Cards */}
        <WeLineWidget />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6 flex flex-col">
            {/* Tâches & Actions préventives */}
            <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 border border-[#1E90FF]/10">
              <TasksList />
            </div>
            
            {/* Incidents Actifs */}
            <div className="flex-grow bg-[#1E1E1E] rounded-xl border border-[#1E90FF]/10">
              <ActiveIncidents />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Recommandations Stratégiques */}
            <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 border border-[#1E90FF]/10">
              <StrategicRecommendations />
            </div>
            
            {/* Assistant IA */}
            <div className="mt-4 md:mt-6">
              <AIAssistant />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
