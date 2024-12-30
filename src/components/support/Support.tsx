import React, { useState } from 'react';
import { Send, Phone, Mail } from 'lucide-react';

const Support: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'envoi du message
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Assistance</h1>

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
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              className="w-full px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Comment pouvons-nous vous aider ?"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Support;
