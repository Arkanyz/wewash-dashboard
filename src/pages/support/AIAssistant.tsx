import React, { useState } from 'react';
import { Bot, Send, MessageCircle } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    type: 'assistant',
    content: "Bonjour ! Je suis l'assistant WeWash. Comment puis-je vous aider aujourd'hui ?"
  }]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: input }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: "Je suis là pour vous aider avec WeWash. Je recherche la meilleure réponse à votre question..." 
      }]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="grid gap-8">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-[#DDE6F2] rounded-2xl">
            <Bot className="w-8 h-8 text-[#5EABFF]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#121212] mb-1">Assistant WeWash</h3>
            <p className="text-[#CACACA]">Je suis là pour répondre à toutes vos questions</p>
          </div>
        </div>

        <div className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-4 scrollbar-thin scrollbar-thumb-[#DDE6F2] scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-2xl bg-[#DDE6F2] flex items-center justify-center mr-3">
                    <Bot className="w-5 h-5 text-[#5EABFF]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-[#5EABFF] to-[#4CAF50] text-white'
                      : 'bg-[#F7F9FC] text-[#121212] border border-[#DDE6F2]'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-2xl bg-[#DDE6F2] flex items-center justify-center ml-3">
                    <MessageCircle className="w-5 h-5 text-[#5EABFF]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 bg-[#F7F9FC] text-[#121212] rounded-2xl px-6 py-4 border border-[#DDE6F2] focus:border-[#5EABFF] focus:ring-2 focus:ring-[#5EABFF]/20 transition-all duration-200 placeholder-[#CACACA]"
            />
            <button
              type="submit"
              className="px-6 bg-gradient-to-r from-[#5EABFF] to-[#4CAF50] text-white rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#5EABFF]/20 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
