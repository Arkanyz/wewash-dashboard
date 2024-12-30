import React, { useState } from 'react';
import { Bell, Moon, Sun, Globe, Shield, Key, User } from 'lucide-react';
import { colors } from '../styles/colors';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const sections: SettingSection[] = [
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
      id: 'appearance',
      title: 'Apparence',
      icon: Moon,
      description: "Personnalisez l'apparence de votre interface"
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
      id: 'api',
      title: 'Clés API',
      icon: Key,
      description: 'Gérez vos clés API et les intégrations'
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
        <p className="text-gray-400 mt-1">Gérez vos préférences et paramètres du compte</p>
      </div>

      {/* Grille des paramètres */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-xl border transition-all text-left ${
                isActive
                  ? 'bg-[#1E90FF]/10 border-[#1E90FF] text-white'
                  : 'bg-[#1E1E1E] border-[#1E90FF]/10 hover:border-[#1E90FF]/30 text-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-[#1E90FF]/20' : 'bg-[#1E1E1E]'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-[#1E90FF]' : 'text-gray-400'
                  }`} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-sm text-gray-400">{section.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Section active */}
      <div className="mt-8 p-6 bg-[#1E1E1E] rounded-xl border border-[#1E90FF]/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {sections.find(s => s.id === activeSection)?.title}
          </h2>
        </div>

        {/* Contenu de la section (à implémenter) */}
        <div className="text-gray-400">
          Le contenu de cette section sera implémenté prochainement.
        </div>
      </div>
    </div>
  );
};

export default Settings;
