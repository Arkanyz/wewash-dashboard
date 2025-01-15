import React from 'react';
import Navigation from '../components/navigation/Navigation';
import { Outlet } from 'react-router-dom';

interface MainLayoutProps {
}

const MainLayout: React.FC<MainLayoutProps> = () => {
  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      <Navigation />
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-24 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
