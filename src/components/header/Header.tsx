import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Barre de recherche */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-gray-100 dark:bg-gray-800/50 border-0 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
