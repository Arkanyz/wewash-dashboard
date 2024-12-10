import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { ThemeToggle } from '../ui/theme-toggle';

interface HeaderProps {
  showAIPanel: boolean;
  onToggleAIPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ showAIPanel, onToggleAIPanel }) => {
  const { userProfile } = useUser();
  
  return (
    <header className="h-16 border-b border-gray-800 bg-[#1a1a1a] dark:bg-gray-900">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search or type command"
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs text-gray-400 bg-gray-700 rounded">⌘F</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <button className="p-2 hover:bg-gray-800 rounded-lg">
            <Bell className="h-5 w-5 text-gray-400" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white dark:text-gray-200">{`${userProfile.firstName} ${userProfile.lastName}`}</div>
              <div className="text-xs text-gray-400">{userProfile.role}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden">
              {userProfile.photoUrl ? (
                <img 
                  src={userProfile.photoUrl} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-lg font-medium">
                  {userProfile.firstName[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
