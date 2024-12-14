import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IconHome, IconWashMachine, IconReportAnalytics, IconSettings, IconUsers } from "@tabler/icons-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: "/", icon: IconHome, label: "Dashboard" },
    { path: "/laundries", icon: IconWashMachine, label: "Laveries" },
    { path: "/reports", icon: IconReportAnalytics, label: "Rapports" },
    { path: "/users", icon: IconUsers, label: "Utilisateurs" },
    { path: "/settings", icon: IconSettings, label: "Paramètres" },
  ];

  return (
    <aside className="w-[220px] bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50">
      {/* Logo */}
      <div className="flex h-14 items-center px-6 border-b border-gray-200/50 dark:border-gray-800/50">
        <IconWashMachine className="h-8 w-8 text-blue-500" />
        <span className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
          WeWash
        </span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202022]"
                }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
              <span>{item.label}</span>
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-[#202022]" />
          <div className="ml-3">
            <p className="font-medium">John Doe</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
