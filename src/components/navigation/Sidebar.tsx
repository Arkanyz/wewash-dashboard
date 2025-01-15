import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Building2, BarChart3, Settings, HelpCircle, Wrench, User, Bell, LogOut } from "lucide-react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { LogoutModal } from "../modals/LogoutModal";
import { useAuth } from "../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    navigate('/welcome');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (path === '/dashboard/laundries') {
      e.preventDefault();
      // Ne rien faire quand on clique sur Laveries
      return;
    }
    navigate(path);
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
            <button
              key={item.path}
              onClick={(e) => handleNavigation(e, item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200
                ${
                  active
                    ? "bg-[#1E90FF]/10 text-[#1E90FF]"
                    : "text-gray-300 hover:bg-blue-900/20 hover:text-white"
                }`}
            >
              <div className="flex items-center justify-center w-8 h-8">
                <Icon className={`h-5 w-5 ${active ? "text-[#1E90FF]" : ""}`} />
              </div>
              <div className="flex-grow text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1E90FF]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile section avec notifications */}
      <div className="absolute bottom-0 w-full p-4 border-t border-blue-900/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-[#1E90FF]/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#1E90FF]" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-white">John Doe</p>
              <p className="text-xs text-gray-400">Administrateur</p>
            </div>
          </div>

          {/* Bouton de notification */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-blue-900/20 transition-colors"
            >
              <Bell className={`h-5 w-5 ${notifications?.some(n => n.unread) ? 'text-[#1E90FF]' : 'text-gray-400'}`} />
              {notifications?.some(n => n.unread) && (
                <span className="absolute top-1 right-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E90FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E90FF]"></span>
                  </span>
                </span>
              )}
            </button>

            {/* Dropdown des notifications */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-2 w-72 bg-[#011946] rounded-lg shadow-lg border border-blue-900/20"
                >
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <h3 className="text-sm font-medium text-white">Notifications</h3>
                      {notifications?.some(n => n.unread) && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-[#1E90FF] hover:text-white transition-colors"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    {notifications?.length > 0 ? (
                      notifications.map(notif => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg cursor-pointer ${
                            notif.unread ? 'bg-[#1E90FF]/10' : 'bg-blue-900/20'
                          }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="font-medium text-white">{notif.title}</div>
                          <div className="text-sm text-gray-300">{notif.message}</div>
                          <div className="text-xs text-gray-400 mt-1">{notif.time}</div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        Aucune notification
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bouton déconnexion */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="absolute bottom-[72px] w-full p-4 border-t border-blue-900/20 flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-blue-900/20 hover:text-white transition-all duration-200"
      >
        <div className="flex items-center justify-center w-8 h-8">
          <LogOut className="h-5 w-5" />
        </div>
        <div className="flex-grow text-left">
          <div className="font-medium">Déconnexion</div>
          <div className="text-xs text-gray-400">Quitter l'application</div>
        </div>
      </button>

      {/* Modal de déconnexion */}
      {showLogoutModal && (
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      )}
    </aside>
  );
};

export default Sidebar;
