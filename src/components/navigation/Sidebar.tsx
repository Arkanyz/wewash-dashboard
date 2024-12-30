import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Building2, BarChart3, Settings, HelpCircle, Wrench, User } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Accueil",
      description: "Vue principale et statistiques"
    },
    {
      path: "/dashboard/laundries",
      icon: Building2,
      label: "Laveries",
      description: "Gestion des laveries"
    },
    {
      path: "/dashboard/technicians",
      icon: Wrench,
      label: "Techniciens",
      description: "Gestion des interventions"
    },
    {
      path: "/dashboard/analytics",
      icon: BarChart3,
      label: "Statistiques & Analyses",
      description: "KPIs et analyses"
    },
    {
      path: "/dashboard/settings",
      icon: Settings,
      label: "Paramètres",
      description: "Configuration système"
    },
    {
      path: "/dashboard/support",
      icon: HelpCircle,
      label: "Support & Aide",
      description: "Aide et assistance"
    }
  ];

  return (
    <aside className="w-[280px] min-h-screen bg-gradient-to-b from-[#000206] to-[#011946] backdrop-blur-xl border-r border-blue-900/20 transition-all duration-300 
                      md:relative md:translate-x-0 md:w-[280px] 
                      sm:fixed sm:top-0 sm:left-0 sm:h-full sm:z-50 sm:w-[80%]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-blue-900/20">
        <span className="text-3xl mr-3">🌊</span>
        <span className="text-lg font-medium text-white">
          WeWash
        </span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200
                ${
                  active
                    ? "bg-[#1E90FF]/10 text-[#1E90FF]"
                    : "text-gray-300 hover:bg-blue-900/20 hover:text-white"
                }`}
            >
              <div className="flex items-center justify-center w-8 h-8">
                <Icon className={`h-5 w-5 ${active ? "text-[#1E90FF]" : ""}`} />
              </div>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1E90FF]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-blue-900/20">
        <div className="flex items-center px-4 py-3 rounded-lg text-sm text-white hover:bg-blue-900/20 transition-all duration-200">
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-[#1E90FF]/10 flex items-center justify-center">
            <User className="h-5 w-5 text-[#1E90FF]" />
          </div>
          <div className="ml-3">
            <p className="font-medium">John Doe</p>
            <p className="text-xs text-gray-400">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
