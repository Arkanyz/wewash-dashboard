import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Globe, Shield, Key, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toggle from '../components/ui/Toggle';
import { LogoutModal } from '../components/modals/LogoutModal';
import { useAuth } from '../context/AuthContext';

// Type pour les paramètres de notification
interface NotificationSettings {
  urgentEnabled: boolean;
  frequency: string;
  types: {
    maintenance: boolean;
    reports: boolean;
    updates: boolean;
  };
}

const Settings: React.FC = () => {
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  const [urgentNotifications, setUrgentNotifications] = useState(true);

  // Récupération des paramètres sauvegardés
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      urgentEnabled: true,
      frequency: 'daily',
      types: {
        maintenance: true,
        reports: true,
        updates: true
      }
    };
  });

  // Sauvegarde automatique des paramètres
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Fonction pour mettre à jour les paramètres
  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationType = (type: keyof typeof notificationSettings.types, checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: checked
      }
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const sections = [
    {
      id: 'profile',
      title: 'Profil',
      icon: User,
      description: 'Gérez vos informations personnelles et vos préférences'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configurez vos préférences de notifications'
    },
    {
      id: 'language',
      title: 'Langue',
      icon: Globe,
      description: "Changez la langue de l'interface"
    },
    {
      id: 'security',
      title: 'Sécurité',
      icon: Shield,
      description: 'Gérez vos paramètres de sécurité'
    },
    {
      id: 'logout',
      title: 'Déconnexion',
      icon: LogOut,
      description: 'Se déconnecter de l\'application'
    }
  ];

  const activeItem = sections.find(s => s.id === activeSection);
  const ActiveIcon = activeItem?.icon;

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                className="w-full px-4 py-2 rounded-xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <button className="px-6 py-2 bg-gradient-to-br from-[#286BD4] to-[#3B7BE8] text-white rounded-xl hover:opacity-90 transition-opacity">
              Sauvegarder les modifications
            </button>
          </div>
        );

      case 'notifications':
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Notifications urgentes */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8F0FE]/50">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <h3 className="font-medium text-xl text-[#286BD4] tracking-tight">Notifications urgentes</h3>
                  <p className="text-[#286BD4]/60 mt-2">Les notifications urgentes seront toujours envoyées en temps réel</p>
                </div>
                <div className="flex items-center">
                  <Toggle
                    checked={notificationSettings.urgentEnabled}
                    onChange={(checked) => updateSettings('urgentEnabled', checked)}
                    size="md"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-[#f0f5ff] rounded-xl">
                <p className="text-[#286BD4]/80 text-sm">Types d'incidents urgents :</p>
                <ul className="mt-2 space-y-2 text-[#286BD4]/70">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>Pannes critiques</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span>Alertes de sécurité</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    <span>Incidents majeurs</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Notifications non urgentes */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8F0FE]/50">
              <div className="mb-4">
                <h3 className="font-medium text-xl text-[#286BD4] tracking-tight">Notifications non urgentes</h3>
                <p className="text-[#286BD4]/60 mt-2">Choisissez la fréquence des notifications pour les événements non prioritaires</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { id: 'half-day', label: 'Demi-journée', icon: '🌓' },
                  { id: 'daily', label: 'Journée', icon: '🌞' },
                ].map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => updateSettings('frequency', option.id)}
                    className={`p-4 rounded-xl flex items-center justify-center gap-3 ${
                      notificationSettings.frequency === option.id
                        ? 'bg-gradient-to-br from-[#286BD4] to-[#3B7BE8] text-white shadow-lg shadow-[#286BD4]/20'
                        : 'bg-[#f0f5ff] text-[#286BD4] hover:bg-[#e5eeff]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Types de notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8F0FE]/50">
              <h3 className="font-medium text-xl text-[#286BD4] tracking-tight mb-4">Types de notifications</h3>
              <div className="space-y-4">
                {[
                  { id: 'maintenance', label: 'Maintenance planifiée', description: 'Interventions et mises à jour prévues' },
                  { id: 'reports', label: 'Rapports d\'activité', description: 'Statistiques et analyses périodiques' },
                  { id: 'updates', label: 'Mises à jour système', description: 'Nouvelles fonctionnalités et améliorations' }
                ].map((type) => (
                  <motion.div
                    key={type.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-[#f0f5ff] transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <label htmlFor={type.id} className="text-[#286BD4] font-medium block">
                        {type.label}
                      </label>
                      <p className="text-[#286BD4]/60 text-sm mt-1">
                        {type.description}
                      </p>
                    </div>
                    <Toggle
                      checked={notificationSettings.types[type.id as keyof typeof notificationSettings.types]}
                      onChange={(checked) => updateNotificationType(type.id as keyof typeof notificationSettings.types, checked)}
                      size="sm"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Sélectionnez votre langue</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Format de date</h3>
              <div className="grid grid-cols-2 gap-4">
                {['DD/MM/YYYY', 'MM/DD/YYYY'].map((format) => (
                  <button
                    key={format}
                    className="px-4 py-2 rounded-xl border border-[#E8F0FE] hover:border-[#286BD4] text-sm text-gray-600"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-700">Authentification à deux facteurs</h3>
                <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <Toggle
                checked={twoFactorEnabled}
                onChange={(checked) => setTwoFactorEnabled(checked)}
                size="md"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Changer le mot de passe</h3>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Mot de passe actuel"
                  className="w-full px-4 py-2 rounded-xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  className="w-full px-4 py-2 rounded-xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full px-4 py-2 rounded-xl border border-[#E8F0FE] focus:border-[#286BD4] focus:outline-none"
                />
                <button className="px-6 py-2 bg-gradient-to-br from-[#286BD4] to-[#3B7BE8] text-white rounded-xl hover:opacity-90 transition-opacity">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          </div>
        );

      case 'logout':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Déconnexion</h3>
              <p className="text-gray-600 mb-6">
                En vous déconnectant, vous devrez vous reconnecter pour accéder à votre compte. 
                Assurez-vous d'avoir sauvegardé toutes vos modifications avant de continuer.
              </p>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Se déconnecter
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Notification 1', message: 'Message de notification 1', time: 'Il y a 5 minutes', unread: true },
    { id: 2, title: 'Notification 2', message: 'Message de notification 2', time: 'Il y a 10 minutes', unread: false },
    { id: 3, title: 'Notification 3', message: 'Message de notification 3', time: 'Il y a 15 minutes', unread: true },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => notification.id === id ? { ...notification, unread: false } : notification));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, unread: false })));
  };

  const handleLogout = () => {
    // Code de déconnexion
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#F9F9F9] p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* En-tête */}
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-semibold text-[#286BD4] tracking-tight">Paramètres</h1>
        <p className="text-[#286BD4]/60 mt-2 text-lg">Gérez vos préférences et paramètres du compte</p>
      </motion.div>

      {/* Grille des paramètres */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-8 rounded-3xl transition-all text-left ${
                isActive
                  ? 'bg-gradient-to-br from-[#286BD4] to-[#3B7BE8] text-white shadow-2xl shadow-[#286BD4]/20'
                  : 'bg-white hover:bg-gradient-to-br hover:from-white hover:to-[#f0f5ff] text-[#286BD4] shadow-xl hover:shadow-2xl hover:shadow-[#286BD4]/10'
              }`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl backdrop-blur-sm ${
                  isActive ? 'bg-white/20' : 'bg-[#f0f5ff]'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    isActive ? 'text-white' : 'text-[#286BD4]'
                  }`} />
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-xl tracking-tight">{section.title}</h3>
                  <p className={`text-base leading-relaxed ${
                    isActive ? 'text-white/90' : 'text-[#286BD4]/60'
                  }`}>{section.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Section active */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="mt-8 p-8 bg-white rounded-3xl shadow-xl border border-[#E8F0FE]/50"
        >
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-6">
              {ActiveIcon && (
                <div className="p-4 rounded-2xl bg-[#f0f5ff]">
                  <ActiveIcon className="w-8 h-8 text-[#286BD4]" />
                </div>
              )}
              <h2 className="text-2xl font-semibold text-[#286BD4] tracking-tight">
                {activeItem?.title}
              </h2>
            </div>
          </motion.div>

          {/* Contenu de la section */}
          <motion.div 
            className="bg-[#F9F9F9] rounded-3xl p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {renderSectionContent()}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Section Notifications (Mobile uniquement) */}
      <div className="md:hidden space-y-6 mt-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${
                    notif.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="font-medium">{notif.title}</div>
                  <div className="text-sm text-gray-600">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{notif.time}</div>
                </div>
              ))}
              <button
                onClick={() => markAllAsRead()}
                className="w-full text-sm text-blue-600 hover:text-blue-700 py-2"
              >
                Tout marquer comme lu
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Aucune notification
            </div>
          )}
        </div>

        {/* Bouton de déconnexion pour mobile */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>

      {/* Modal de déconnexion */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={signOut}
      />

      {/* Style global pour les inputs et boutons */}
      <style jsx global>{`
        input, select {
          transition: all 0.3s ease;
          background: white;
          color: #286BD4;
        }
        
        input::placeholder {
          color: #286BD4/40;
        }
        
        input:focus, select:focus {
          box-shadow: 0 0 0 3px rgba(40, 107, 212, 0.1);
          transform: translateY(-1px);
        }
        
        button {
          transition: all 0.3s cubic-bezier(0.6, -0.05, 0.01, 0.99);
        }
        
        .toggle-switch {
          transition: transform 0.5s cubic-bezier(0.6, -0.05, 0.01, 0.99);
        }
      `}</style>
    </motion.div>
  );
};

export default Settings;
