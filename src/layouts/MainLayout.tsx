import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Header from "../components/header/Header";

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 p-8">
            <div className="h-full rounded-2xl bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl shadow-sm">
              <div className="h-full overflow-auto px-8 py-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
