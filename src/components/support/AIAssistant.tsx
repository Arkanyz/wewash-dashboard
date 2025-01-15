import React, { useState } from 'react';
import { Bot, Send, MessageCircle } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    
    // Simuler une réponse de l'assistant (à remplacer par l'appel API réel)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: "Je suis là pour vous aider avec WeWash. Que puis-je faire pour vous ?" 
      }]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="bg-[#1A1D1D] rounded-lg p-6 h-[600px] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Assistant WeWash</h2>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
