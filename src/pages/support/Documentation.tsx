import React from 'react';
import { Book, Bell, FileText, Building2, Code, ExternalLink } from 'lucide-react';

interface GuideSection {
  title: string;
  icon: React.ReactNode;
  content: string[];
  category: string;
  severity?: 'error' | 'warning' | 'success';
}

const Documentation: React.FC = () => {
  const guides: GuideSection[] = [
    {
      title: 'Comment ajouter une nouvelle laverie ?',
      icon: <Building2 className="w-6 h-6 text-[#5EABFF]" />,
      content: [
        '1. Accédez à la section "Laveries" dans le menu principal',
        '2. Cliquez sur le bouton "Ajouter une laverie"',
        '3. Remplissez les informations requises (nom, adresse, etc.)',
        '4. Configurez les machines disponibles',
        '5. Validez la création'
      ],
      category: 'Gestion des laveries',
      severity: 'success'
    },
    {
      title: 'Comment configurer les alertes ?',
      icon: <Bell className="w-6 h-6 text-[#FFA500]" />,
      content: [
        '1. Accédez à la section "Alertes" dans les paramètres',
        '2. Sélectionnez le type d\'alerte à configurer',
        '3. Définissez les conditions de déclenchement',
        '4. Choisissez les destinataires',
        '5. Activez l\'alerte'
      ],
      category: 'Alertes & Notifications',
      severity: 'warning'
    },
    {
      title: 'Comment générer un rapport d\'incident ?',
      icon: <FileText className="w-6 h-6 text-[#FF6B6B]" />,
      content: [
        '1. Accédez à la section "Rapports"',
        '2. Sélectionnez "Nouveau rapport d\'incident"',
        '3. Remplissez les détails de l\'incident',
        '4. Ajoutez des photos si nécessaire',
        '5. Soumettez le rapport'
      ],
      category: 'Rapports & Analyses',
      severity: 'error'
    }
  ];

  const getSeverityColor = (severity?: 'error' | 'warning' | 'success') => {
    switch (severity) {
      case 'error':
        return '#FF6B6B';
      case 'warning':
        return '#FFA500';
      case 'success':
        return '#4CAF50';
      default:
        return '#5EABFF';
    }
  };

  return (
    <div className="grid gap-8">
      {/* Guides utilisateur */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-[#DDE6F2] rounded-2xl">
            <Book className="w-8 h-8 text-[#5EABFF]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#121212] mb-1">Guides utilisateur</h2>
            <p className="text-[#CACACA]">Tout ce dont vous avez besoin pour utiliser WeWash</p>
          </div>
        </div>

        <div className="grid gap-8">
          {guides.map((guide, index) => (
            <div 
              key={index} 
              className="relative bg-[#F7F9FC] rounded-2xl p-6 border border-[#DDE6F2] hover:border-[#5EABFF] transition-all duration-200 shadow-sm"
            >
              <div 
                className="absolute -top-3 left-6 px-3 py-1 bg-white rounded-2xl text-sm"
                style={{ color: getSeverityColor(guide.severity) }}
              >
                {guide.category}
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#DDE6F2] rounded-2xl mt-2">
                  {guide.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#121212] mb-4">{guide.title}</h3>
                  <ul className="space-y-3">
                    {guide.content.map((step, stepIndex) => (
                      <li 
                        key={stepIndex} 
                        className="text-[#CACACA] flex items-start gap-2"
                      >
                        <span 
                          className="inline-block px-2 py-0.5 bg-[#DDE6F2] rounded text-sm"
                          style={{ color: getSeverityColor(guide.severity) }}
                        >
                          {stepIndex + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation technique */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-[#DDE6F2] rounded-2xl">
            <Code className="w-8 h-8 text-[#5EABFF]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#121212] mb-1">Documentation technique</h2>
            <p className="text-[#CACACA]">Ressources pour les développeurs et intégrateurs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/docs/technical"
            className="group bg-[#F7F9FC] rounded-2xl p-6 border border-[#DDE6F2] hover:border-[#5EABFF] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <Book className="w-6 h-6 text-[#5EABFF]" />
              <h3 className="text-lg font-semibold text-[#121212]">Documentation technique</h3>
              <ExternalLink className="w-4 h-4 text-[#5EABFF] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <p className="text-[#CACACA]">
              Accédez à la documentation technique complète de WeWash
            </p>
          </a>

          <a
            href="/docs/api"
            className="group bg-[#F7F9FC] rounded-2xl p-6 border border-[#DDE6F2] hover:border-[#5EABFF] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <Code className="w-6 h-6 text-[#5EABFF]" />
              <h3 className="text-lg font-semibold text-[#121212]">API Documentation</h3>
              <ExternalLink className="w-4 h-4 text-[#5EABFF] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <p className="text-[#CACACA]">
              Explorez notre API et ses endpoints
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
