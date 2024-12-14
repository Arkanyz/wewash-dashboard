import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Header from "../components/header/Header";
import AIPanel from "../components/ai/AIPanel";

const MainLayout = () => {
  const [showAIPanel, setShowAIPanel] = useState(true);

  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header onToggleAI={() => setShowAIPanel(!showAIPanel)} showAI={showAIPanel} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 p-8">
            <div className="h-full rounded-2xl bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl shadow-sm">
              <div className="h-full overflow-auto px-8 py-6">
                <Outlet />
              </div>
            </div>
          </main>

          {/* Panneau IA avec animation de transition */}
          <div
            className={`w-[400px] transition-all duration-300 ease-in-out transform 
                       ${showAIPanel ? 'translate-x-0' : 'translate-x-full'} 
                       border-l border-gray-200/50 dark:border-gray-800/50 
                       bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl`}
          >
            {showAIPanel && <AIPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
