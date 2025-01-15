import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconX, IconSend, IconMessageCircle, IconHelp, IconChevronDown } from '@tabler/icons-react';
import { generateChatResponse, ChatMessage } from '../utils/chatbot';

const Support: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Bienvenue sur l\'assistant virtuel WeWash ! Je suis là pour répondre à vos questions.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const supportOptions = [
    {
      id: 'chat',
      title: 'Assistant virtuel',
      description: 'Obtenez des réponses instantanées',
      icon: IconMessageCircle,
      content: 'Service disponible 24/7',
      action: 'Démarrer une conversation'
    },
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Trouvez rapidement des réponses',
      icon: IconHelp,
      content: 'Consultez notre base de connaissances',
      action: 'Voir la FAQ'
    },
    {
      id: 'tutorials',
      title: 'Tutoriels vidéo',
      description: 'Apprenez à utiliser nos services',
      icon: IconSend,
      content: 'Accédez à nos guides vidéo',
      action: 'Voir les tutoriels'
    },
    {
      id: 'documentation',
      title: 'Documentation',
      description: 'Guides détaillés et ressources',
      icon: IconSend,
      content: 'Documentation technique complète',
      action: 'Consulter'
    }
  ];

  const faqItems = [
    {
      title: "Comment utiliser le tableau de bord ?",
      content: "Le tableau de bord vous permet de :\n- Voir l'état de toutes vos laveries\n- Consulter les statistiques d'utilisation\n- Gérer vos paramètres\n- Accéder aux rapports"
    },
    {
      title: "Comment gérer mes laveries ?",
      content: "Dans la section 'Gestion des laveries' vous pouvez :\n- Ajouter/supprimer des laveries\n- Configurer les équipements\n- Définir les tarifs\n- Gérer les accès"
    },
    {
      title: "Comment accéder aux statistiques ?",
      content: "Les statistiques sont disponibles dans :\n- Le tableau de bord principal\n- La section 'Rapports'\n- Les analyses par laverie\n- Les exports personnalisés"
    },
    {
      title: "Comment gérer les utilisateurs ?",
      content: "La gestion des utilisateurs permet de :\n- Créer des comptes admin\n- Définir les rôles\n- Gérer les permissions\n- Suivre les activités"
    },
    {
      title: "Comment configurer les notifications ?",
      content: "Configurez vos notifications dans :\n- Paramètres > Notifications\n- Par type d'alerte\n- Par laverie\n- Par niveau d'urgence"
    },
    {
      title: "Comment exporter les données ?",
      content: "Exportez vos données via :\n- La section 'Rapports'\n- Les formats CSV/Excel\n- Les périodes personnalisées\n- Les filtres avancés"
    },
    {
      title: "Comment gérer la facturation ?",
      content: "La gestion de la facturation inclut :\n- Génération de factures\n- Suivi des paiements\n- Paramètres de TVA\n- Exports comptables"
    },
    {
      title: "Comment personnaliser mon interface ?",
      content: "Personnalisez votre expérience via :\n- Thèmes visuels\n- Disposition des widgets\n- Raccourcis personnalisés\n- Préférences d'affichage"
    },
    {
      title: "Sécurité et authentification",
      content: "La sécurité de l'application inclut :\n- Authentification 2FA\n- Gestion des sessions\n- Logs de connexion\n- Politique de mots de passe"
    },
    {
      title: "Support technique",
      content: "Le support technique offre :\n- Documentation détaillée\n- Chat en direct\n- Tickets prioritaires\n- Formation en ligne"
    }
  ];

  const handleStartChat = () => {
    setShowChatbot(true);
  };

  const handleUserMessage = async (message: string) => {
    if (!message.trim()) return;

    // Ajouter le message de l'utilisateur
    const newMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newMessage]);
    setIsTyping(true);

    try {
      // Générer la réponse
      const response = await generateChatResponse([...chatHistory, newMessage]);
      
      // Ajouter la réponse de l'assistant
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      setChatHistory(prev => [...prev, {
        role: 'system',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFaqClick = (content: string) => {
    setShowChatbot(true);
    setShowFAQ(false);
    const faqMessage: ChatMessage = {
      role: 'user',
      content: content
    };
    setChatHistory(prev => [...prev, faqMessage]);
    handleUserMessage(content);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-white to-blue-50/50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#286BD4] mb-2">Support</h1>
          <p className="text-[#286BD4]/70">Notre équipe est là pour vous aider</p>
        </div>

        {/* Recherche */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une aide..."
              className="w-full px-6 py-4 rounded-2xl bg-white border border-[#E8F0FE] text-[#286BD4] placeholder-[#286BD4]/40
                       focus:outline-none focus:ring-2 focus:ring-[#286BD4]/20 focus:border-[#286BD4]
                       shadow-lg shadow-[#286BD4]/5"
            />
            <IconHelp className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#286BD4]/40 w-5 h-5" />
          </div>
        </div>

        {/* Options de support */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-[#286BD4]/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#286BD4]/5 rounded-2xl">
                    <Icon size={24} color="#286BD4" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#286BD4]">{option.title}</h3>
                    <p className="text-[#286BD4]/70">{option.description}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => option.id === 'chat' ? handleStartChat() : option.id === 'faq' ? setShowFAQ(true) : null}
                  className={`w-full px-4 py-2.5 ${
                    option.id === 'chat' 
                      ? 'bg-[#286BD4] text-white hover:bg-[#286BD4]/90'
                      : 'bg-[#286BD4]/5 text-[#286BD4] hover:bg-[#286BD4]/10'
                  } rounded-xl transition-colors`}
                >
                  {option.action}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Modal */}
        {showFAQ && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-white/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-xl border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-[#286BD4]">Foire Aux Questions</h2>
                <button
                  onClick={() => {
                    setShowFAQ(false);
                    setSelectedFaq(null);
                  }}
                  className="p-2 hover:bg-[#286BD4]/5 rounded-full text-[#286BD4] transition-colors duration-200"
                >
                  <IconX size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {faqItems.map((item, index) => (
                    <div 
                      key={index} 
                      className={`border border-gray-100 rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedFaq === index ? 'shadow-md' : 'hover:shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                        className={`w-full p-6 text-left flex justify-between items-center transition-all duration-200 ${
                          selectedFaq === index 
                            ? 'bg-[#286BD4] text-white' 
                            : 'bg-white text-[#286BD4] hover:bg-[#286BD4]/5'
                        }`}
                      >
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <div className={`transform transition-transform duration-200 ${selectedFaq === index ? 'rotate-180' : ''}`}>
                          <IconChevronDown size={20} />
                        </div>
                      </button>
                      {selectedFaq === index && (
                        <div className="p-6 bg-white border-t border-gray-100">
                          <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot Modal */}
        {showChatbot && (
          <div className="fixed inset-0 bg-[#286BD4]/5 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-xl"
              style={{ height: '85vh', maxHeight: '800px' }}
            >
              {/* Header */}
              <div className="px-8 py-6 bg-[#286BD4]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <IconMessageCircle size={24} color="#ffffff" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Assistant WeWash</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <p className="text-sm text-white/90">En ligne • Réponse instantanée</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChatbot(false)}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 
                             transition-colors flex items-center justify-center"
                  >
                    <IconX size={24} color="#ffffff" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {chatHistory.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const isAssistant = msg.role === 'assistant';

                  if (isAssistant) {
                    return (
                      <div key={index} className="flex justify-start">
                        <div className="w-8 h-8 rounded-xl bg-[#286BD4] flex items-center justify-center">
                          <IconMessageCircle size={20} color="#ffffff" strokeWidth={2} />
                        </div>
                        <div
                          className="relative max-w-[70%] px-6 py-4 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md"
                        >
                          {msg.content}
                          <div className={`absolute -bottom-5 left-0 
                                        text-[10px] text-gray-400`}>
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={index} className="flex justify-end">
                      <div
                        className="relative max-w-[70%] px-6 py-4 rounded-2xl bg-[#286BD4] text-white rounded-br-md"
                      >
                        {msg.content}
                        <div className={`absolute -bottom-5 right-0 
                                      text-[10px] text-white`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-[#286BD4] flex items-center justify-center text-white text-sm font-medium">
                        V
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#286BD4] flex items-center justify-center">
                      <IconMessageCircle size={20} color="#ffffff" strokeWidth={2} />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-[#286BD4]"
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-[#286BD4]"
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-[#286BD4]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Votre message..."
                      className="w-full px-6 py-4 pr-12 rounded-xl bg-gray-100
                               text-gray-900 placeholder-gray-400 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#286BD4]
                               transition-all duration-200"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUserMessage(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                        if (input && input.value) {
                          handleUserMessage(input.value);
                          input.value = '';
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10
                               bg-[#286BD4] rounded-xl text-white 
                               flex items-center justify-center
                               hover:bg-[#3277e3] transition-colors"
                    >
                      <IconSend size={20} color="#ffffff" />
                    </button>
                  </div>
                  <button
                    onClick={() => window.open('/faq', '_blank')}
                    className="px-6 py-4 text-sm font-medium text-[#286BD4] bg-gray-100
                             hover:bg-gray-200 rounded-xl transition-colors
                             flex items-center gap-2"
                  >
                    <IconHelp size={20} color="#286BD4" strokeWidth={2} />
                    FAQ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Support;
