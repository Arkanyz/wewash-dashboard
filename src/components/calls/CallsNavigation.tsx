import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const tabs = [
  {
    name: 'Total des appels',
    path: '/dashboard/calls',
    icon: Phone,
    color: 'text-blue-600'
  },
  {
    name: 'Demandes info',
    path: '/dashboard/info-requests',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    name: 'Problèmes',
    path: '/dashboard/problems',
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
  {
    name: 'Incidents critiques',
    path: '/dashboard/critical',
    icon: AlertCircle,
    color: 'text-red-600'
  }
];

export function CallsNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="border-b">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${isActive
                  ? `border-blue-500 ${tab.color}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
