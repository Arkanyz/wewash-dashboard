import React, { useState } from 'react';
import { Search, PlayCircle, MessageCircle, FileText, ChevronRight, Bot } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface Tutorial {
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
}

const Support: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems: FAQItem[] = [
    {
      question: "Comment ajouter une nouvelle laverie ?",
      answer: "Accédez à la section Laveries et cliquez sur le bouton 'Ajouter une laverie'. Remplissez les informations requises dans le formulaire.",
      category: "Laveries"
    },
    {
      question: "Comment configurer les alertes ?",
      answer: "Dans les Paramètres, sélectionnez 'Configuration des alertes' et personnalisez vos préférences de notification.",
      category: "Alertes"
    },
    {
      question: "Comment générer un rapport d'incident ?",
      answer: "Dans la section Statistiques & Analyses, utilisez l'option 'Générer un rapport' et sélectionnez la période souhaitée.",
      category: "Rapports"
    }
  ];

  const tutorials: Tutorial[] = [
    {
      title: "Guide complet de WeWash",
      duration: "5:30",
      thumbnail: "🎥",
      category: "Débutant"
    },
    {
      title: "Configuration avancée des alertes",
      duration: "3:45",
      thumbnail: "🔔",
      category: "Avancé"
    },
    {
      title: "Analyse des données et KPIs",
      duration: "4:15",
      thumbnail: "📊",
      category: "Avancé"
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Support & Aide</h1>
          <p className="text-gray-400 mt-1">Trouvez de l'aide et des ressources utiles</p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Rechercher dans l'aide..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E1E1E] text-white rounded-lg pl-10 pr-4 py-2 border border-[#1E90FF]/10 focus:border-[#1E90FF]/30 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Assistant IA */}
      <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#1E90FF]/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#1E90FF]/10 rounded-lg">
            <Bot className="w-6 h-6 text-[#1E90FF]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Assistant IA</h2>
            <p className="text-gray-400">Posez vos questions à notre assistant intelligent</p>
          </div>
          <button className="ml-auto px-4 py-2 bg-[#1E90FF] text-white rounded-lg hover:bg-[#1E90FF]/90">
            Démarrer une conversation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Questions fréquentes</h2>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-[#1E1E1E] rounded-lg p-4 border border-[#1E90FF]/10 hover:border-[#1E90FF]/30 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">{item.question}</h3>
                    <span className="text-xs text-[#1E90FF] mt-1">{item.category}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tutoriels vidéo */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Tutoriels vidéo</h2>
          <div className="space-y-3">
            {tutorials.map((tutorial, index) => (
              <div
                key={index}
                className="bg-[#1E1E1E] rounded-lg p-4 border border-[#1E90FF]/10 hover:border-[#1E90FF]/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{tutorial.thumbnail}</div>
                  <div className="flex-grow">
                    <h3 className="text-white font-medium">{tutorial.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#1E90FF]">{tutorial.category}</span>
                      <span className="text-xs text-gray-400">{tutorial.duration}</span>
                    </div>
                  </div>
                  <PlayCircle className="w-8 h-8 text-[#1E90FF]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact support */}
      <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#1E90FF]/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1E90FF]/10 rounded-lg">
              <MessageCircle className="w-6 h-6 text-[#1E90FF]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Besoin d'aide supplémentaire ?</h2>
              <p className="text-gray-400">Notre équipe de support est disponible 24/7</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#1E90FF]/10 text-[#1E90FF] rounded-lg hover:bg-[#1E90FF]/20">
            Contacter le support
          </button>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#1E90FF]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1E90FF]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[#1E90FF]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Documentation technique</h2>
              <p className="text-gray-400">Guides détaillés et documentation API</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#1E90FF]/10 text-[#1E90FF] rounded-lg hover:bg-[#1E90FF]/20">
            Accéder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
