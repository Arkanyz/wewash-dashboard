import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar, 
  Euro, 
  CreditCard, 
  Printer,
  ChevronRight,
  History,
  Settings,
  FileText
} from 'lucide-react';

interface Ticket {
  id: string;
  date: string;
  machineId: string;
  amount: number;
  paymentMethod: string;
  customerName?: string;
  status: 'completed' | 'pending' | 'cancelled';
  laverie: string;
}

interface TicketSection {
  id: string;
  label: string;
  icon: any;
}

const mockTickets: Ticket[] = [
  {
    id: 'TK-001',
    date: '2024-12-08 14:30',
    machineId: 'WM-01',
    amount: 5.50,
    paymentMethod: 'Carte Bancaire',
    status: 'completed',
    laverie: 'Laverie Paris 11'
  },
  {
    id: 'TK-002',
    date: '2024-12-08 15:15',
    machineId: 'WM-03',
    amount: 4.00,
    paymentMethod: 'Espèces',
    status: 'completed',
    laverie: 'Laverie Lyon 6'
  },
  {
    id: 'TK-003',
    date: '2024-12-08 16:00',
    machineId: 'WM-02',
    amount: 5.50,
    paymentMethod: 'Carte Bancaire',
    customerName: 'Jean Dupont',
    status: 'pending',
    laverie: 'Laverie Paris 11'
  }
];

const sections: TicketSection[] = [
  { id: 'current', label: 'Tickets en cours', icon: Receipt },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'reports', label: 'Rapports', icon: FileText },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const TicketsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [tickets] = useState<Ticket[]>(mockTickets);

  // Calcul des statistiques
  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.amount, 0);
  const completedTickets = tickets.filter(ticket => ticket.status === 'completed').length;
  const pendingTickets = tickets.filter(ticket => ticket.status === 'pending').length;

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.laverie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'current':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Receipt className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Total Tickets</p>
                    <h3 className="text-2xl font-bold">{tickets.length}</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Euro className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">Montant Total</p>
                    <h3 className="text-2xl font-bold">{totalAmount.toFixed(2)} €</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 p-6 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <CreditCard className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-gray-400">En attente</p>
                    <h3 className="text-2xl font-bold">{pendingTickets}</h3>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par n° ticket, machine, laverie..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <button 
                  className="px-4 py-2 bg-gray-800 rounded-lg flex items-center gap-2"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  <Filter className="h-4 w-4" />
                  Filtrer
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showFilterMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4 z-10"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Période</label>
                        <div className="space-y-2">
                          <input
                            type="date"
                            className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          />
                          <input
                            type="date"
                            className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Statut</label>
                        <select
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">Tous</option>
                          <option value="completed">Complétés</option>
                          <option value="pending">En attente</option>
                          <option value="cancelled">Annulés</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        N° Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Laverie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Machine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Paiement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredTickets.map((ticket) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">{ticket.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ticket.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ticket.laverie}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ticket.machineId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-500">
                          {ticket.amount.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ticket.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ticket.customerName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des tickets</h2>
            {/* Add history content */}
          </div>
        );

      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Rapports</h2>
            {/* Add reports content */}
          </div>
        );

      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Paramètres des tickets</h2>
            {/* Add settings content */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tickets de caisse</h2>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.label}</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {renderSectionContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TicketsTab;
