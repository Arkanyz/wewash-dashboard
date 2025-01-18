import React, { useState } from 'react';
import { Menu, X, Home, Building2, BarChart3, Settings, HelpCircle, Wrench, User, Bell, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoutModal } from '../modals/LogoutModal';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const navigationItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Accueil",
      description: "Vue principale et statistiques"
    },
    {
      path: "/laundries",
      icon: Building2,
      label: "Laveries",
      description: "Gestion des laveries"
    },
    {
      path: "/technicians",
      icon: Wrench,
      label: "Techniciens",
      description: "Gestion des interventions"
    },
    {
      path: "/statistics",
      icon: BarChart3,
      label: "Statistiques & Analyses",
      description: "Analyse détaillée des appels"
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Paramètres",
      description: "Configuration système"
    },
    {
      path: "/support",
      icon: HelpCircle,
      label: "Support",
      description: "Aide et assistance"
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] min-h-screen bg-gradient-to-b from-[#000206] to-[#011946] backdrop-blur-xl border-r border-blue-900/20">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-blue-900/20">
          <span className="text-3xl mr-3">🌊</span>
          <span className="text-lg font-medium text-white">
            WeWash
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
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

        {/* Profile section avec notifications */}
        <div className="p-4 border-t border-blue-900/20">
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
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full right-[-200px] mb-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 backdrop-blur-xl"
                    style={{
                      filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))'
                    }}
                  >
                    <div className="max-h-[400px] overflow-y-auto">
                      <div className="flex items-center justify-between p-4 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10 backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-blue-500" />
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        </div>
                        {notifications?.some(n => n.unread) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllAsRead();
                            }}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        {notifications?.length > 0 ? (
                          notifications.map(notif => (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                notif.unread 
                                  ? 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => markAsRead(notif.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                  notif.unread 
                                    ? 'bg-blue-500' 
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-sm font-medium ${
                                      notif.unread 
                                        ? 'text-gray-900 dark:text-white' 
                                        : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                      {notif.title}
                                    </p>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                      {notif.time}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 px-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                              <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Pas de notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                              Nous vous notifierons quand il y aura du nouveau
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-4 h-16 bg-gradient-to-r from-[#000206] to-[#011946] backdrop-blur-xl border-b border-blue-900/20">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <span className="text-2xl mr-2">🌊</span>
            <span className="text-lg font-medium text-white">WeWash</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="h-6 w-6" />
              {notifications?.some(n => n.unread) && (
                <span className="absolute top-1 right-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E90FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E90FF]"></span>
                  </span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-30 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <nav className="relative w-[80%] max-w-[320px] h-full bg-gradient-to-b from-[#000206] to-[#011946] backdrop-blur-xl overflow-y-auto">
          <div className="flex items-center justify-between h-16 px-6 border-b border-blue-900/20">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🌊</span>
              <span className="text-lg font-medium text-white">WeWash</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200
                    ${
                      active
                        ? "bg-[#1E90FF]/10 text-[#1E90FF]"
                        : "text-gray-300 hover:bg-blue-900/20 hover:text-white"
                    }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-[#1E90FF]" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Modal de déconnexion */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Navigation;
