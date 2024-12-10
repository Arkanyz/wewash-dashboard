import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Phone, Settings } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import AIPanel from '../components/ai/AIPanel';
import Dashboard from '../components/dashboard/Dashboard';
import CalendarTab from '../components/calendar/Calendar';
import WeLineWidget from '../components/weline/WeLineWidget';
import SettingsTab from '../components/settings/SettingsTab';
import { UserProvider } from '../contexts/UserContext';

const MainLayout: React.FC = () => {
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');

  return (
    <UserProvider>
      <div className="flex h-screen w-screen bg-[#1E201F] text-white overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header showAIPanel={showAIPanel} onToggleAIPanel={() => setShowAIPanel(!showAIPanel)} />
        
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>

        {showAIPanel && (
          <div className="w-[400px] border-l border-[#2A2B2A] overflow-hidden">
            <AIPanel />
          </div>
        )}
      </div>
    </UserProvider>
  );
};

export default MainLayout;
