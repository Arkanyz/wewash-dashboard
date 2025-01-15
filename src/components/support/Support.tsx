import React, { useState } from 'react';
import { Send, Phone, Mail, MessageCircle, Book } from 'lucide-react';
import AIAssistant from './AIAssistant';
import Documentation from './Documentation';
import { useSupport } from '../../hooks/useSupport';

const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'assistant' | 'docs'>('contact');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { createTicket, loading, error } = useSupport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket(subject, message);
      setSubject('');
      setMessage('');
      // Afficher un message de succès
    } catch (err) {
      // Gérer l'erreur
      console.error('Erreur lors de la création du ticket:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Support & Aide</h1>

      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Phone className="w-5 h-5" />
          Contact
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'assistant'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          Assistant
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'docs'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Book className="w-5 h-5" />
          Documentation
        </button>
      </div>

      {activeTab === 'contact' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#1A1D1D] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold">Téléphone</h3>
              </div>
              <p className="text-gray-300 mb-4">Notre équipe est disponible 7j/7 de 8h à 20h</p>
              <a href="tel:+33123456789" className="text-blue-500 hover:text-blue-400">
                +33 1 23 45 67 89
              </a>
            </div>

            <div className="bg-[#1A1D1D] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold">Email</h3>
              </div>
              <p className="text-gray-300 mb-4">Nous répondons sous 24h ouvrées</p>
              <a href="mailto:support@wewash.fr" className="text-blue-500 hover:text-blue-400">
                support@wewash.fr
              </a>
            </div>
          </div>

          <div className="bg-[#1A1D1D] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Sujet
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sujet de votre message"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Envoyer
              </button>
            </form>
          </div>
        </>
      )}

      {activeTab === 'assistant' && <AIAssistant />}
      {activeTab === 'docs' && <Documentation />}
    </div>
  );
};

export default Support;
