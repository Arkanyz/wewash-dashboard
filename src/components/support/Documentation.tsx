import React from 'react';
import { Book, Bell, FileText, Building2, Code } from 'lucide-react';

interface GuideSection {
  title: string;
  icon: React.ReactNode;
  content: string[];
}

const Documentation: React.FC = () => {
  const guides: GuideSection[] = [
    {
      title: 'Comment ajouter une nouvelle laverie ?',
      icon: <Building2 className="w-5 h-5 text-blue-500" />,
      content: [
        '1. Accédez à la section "Laveries" dans le menu principal',
        '2. Cliquez sur le bouton "Ajouter une laverie"',
        '3. Remplissez les informations requises (nom, adresse, etc.)',
        '4. Configurez les machines disponibles',
        '5. Validez la création'
      ]
    },
    {
      title: 'Comment configurer les alertes ?',
      icon: <Bell className="w-5 h-5 text-blue-500" />,
      content: [
        '1. Accédez à la section "Alertes" dans les paramètres',
        '2. Sélectionnez le type d\'alerte à configurer',
        '3. Définissez les conditions de déclenchement',
        '4. Choisissez les destinataires',
        '5. Activez l\'alerte'
      ]
    },
    {
      title: 'Comment générer un rapport d\'incident ?',
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      content: [
        '1. Accédez à la section "Rapports"',
        '2. Sélectionnez "Nouveau rapport d\'incident"',
        '3. Remplissez les détails de l\'incident',
        '4. Ajoutez des photos si nécessaire',
        '5. Soumettez le rapport'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Guides utilisateur */}
      <div className="bg-[#1A1D1D] rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Book className="w-6 h-6 text-blue-500" />
          Guides utilisateur
        </h2>
        <div className="space-y-6">
          {guides.map((guide, index) => (
            <div key={index} className="border-b border-gray-700 pb-6 last:border-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {guide.icon}
                {guide.title}
              </h3>
              <ul className="space-y-2 text-gray-300">
                {guide.content.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation technique */}
      <div className="bg-[#1A1D1D] rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Code className="w-6 h-6 text-blue-500" />
          Documentation technique
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/docs/technical"
            className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Documentation technique</h3>
            <p className="text-gray-300">
              Accédez à la documentation technique complète de WeWash
            </p>
          </a>
          <a
            href="/docs/api"
            className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
            <p className="text-gray-300">
              Explorez notre API et ses endpoints
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
