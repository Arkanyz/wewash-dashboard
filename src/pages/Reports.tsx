import React, { useState } from 'react';
import { Calendar, Download, Filter, ChevronDown } from 'lucide-react';
import { colors } from '../styles/colors';

// Types pour les rapports
interface Report {
  id: string;
  title: string;
  type: 'performance' | 'maintenance' | 'financial';
  date: string;
  status: 'completed' | 'pending';
  size: string;
}

const Reports: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('last30');

  // Données mockées pour l'exemple
  const reports: Report[] = [
    {
      id: '1',
      title: 'Rapport de Performance - Décembre 2024',
      type: 'performance',
      date: '2024-12-25',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: '2',
      title: 'Maintenance Préventive Q4 2024',
      type: 'maintenance',
      date: '2024-12-20',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: '3',
      title: 'Analyse Financière - Décembre 2024',
      type: 'financial',
      date: '2024-12-15',
      status: 'pending',
      size: '3.1 MB'
    }
  ];

  const filteredReports = reports.filter(report => 
    (selectedType === 'all' || report.type === selectedType)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'text-[#1E90FF]';
      case 'maintenance':
        return 'text-[#32CD32]';
      case 'financial':
        return 'text-[#9370DB]';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">Rapports</h1>
        
        <div className="flex flex-wrap gap-4">
          {/* Filtre par type */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] text-white rounded-lg border border-[#1E90FF]/10 hover:border-[#1E90FF]/30">
              <Filter className="w-4 h-4" />
              <span>Type</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Filtre par date */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] text-white rounded-lg border border-[#1E90FF]/10 hover:border-[#1E90FF]/30">
              <Calendar className="w-4 h-4" />
              <span>Période</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des rapports */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-[#1E1E1E] rounded-xl p-4 border border-[#1E90FF]/10 hover:border-[#1E90FF]/30 transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${getTypeColor(report.type)}`}>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-400">{report.date}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                    {report.status === 'completed' ? 'Complété' : 'En cours'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{report.size}</span>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF]/10 text-[#1E90FF] rounded-lg hover:bg-[#1E90FF]/20 transition-colors"
                  disabled={report.status !== 'completed'}
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
