import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  Wrench,
  BarChart2,
  Ticket,
  HelpCircle,
  MessagesSquare,
  Settings,
  Receipt
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Laveries', path: '/laveries' },
  { icon: AlertTriangle, label: 'Signalements', path: '/signalements' },
  { icon: Wrench, label: 'Interventions', path: '/interventions' },
  { icon: BarChart2, label: 'Statistiques', path: '/statistiques' },
  { icon: Receipt, label: 'Tickets', path: '/tickets' },
  { icon: Wrench, label: 'Maintenance', path: '/maintenance' },
  { icon: Settings, label: 'Paramètres', path: '/parametres' },
];

const supportItems = [
  { icon: HelpCircle, label: 'FAQ', path: '/faq' },
  { icon: MessagesSquare, label: 'Assistance', path: '/assistance' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800">
      <div className="h-full flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">WeWash</h1>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            SUPPORT
          </p>
          {supportItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white">Become Pro Access</h3>
            <p className="text-xs text-gray-400 mt-1">
              Try your experience for using more features
            </p>
            <button className="mt-3 w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
              Upgrade Pro
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
