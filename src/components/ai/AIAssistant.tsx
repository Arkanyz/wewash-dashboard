import React from 'react';
import { Mic } from 'lucide-react';

const AIAssistant: React.FC = () => {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden">
      <div 
        className="flex flex-col h-full relative" 
        style={{
          background: 'linear-gradient(rgb(199, 215, 241) 0%, rgb(205, 220, 242) 20%, rgb(211, 223, 244) 40%, rgb(216, 228, 244) 60%, rgb(227, 235, 248) 80%, rgb(234, 241, 251) 100%)',
          minHeight: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* En-tête */}
        <div className="relative z-10 text-center py-6 px-8 max-w-full">
          <h2 className="text-xl font-bold mb-2 text-gray-800 truncate">Assistant IA</h2>
          <p className="text-base text-gray-600 whitespace-normal break-words">
            Bonjour, utilisateur ! Comment puis-je vous aider ?
          </p>
        </div>

        {/* Zone de Canvas pour effets visuels */}
        <div className="flex-grow relative" style={{ minHeight: '180px' }}>
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              filter: 'blur(1px)',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)'
            }}
          />
        </div>

        {/* Bouton principal */}
        <div className="px-4 pb-4">
          <button className="w-full h-[50px] bg-black hover:bg-[#1c3a5f] text-white rounded-[25px] flex items-center justify-center gap-2 transition-colors duration-300 font-bold shadow-lg">
            <span>Message Assistant IA</span>
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
