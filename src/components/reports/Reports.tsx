import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, Download, Loader2, Search } from 'lucide-react';
import { useSupabase } from '../../providers/SupabaseProvider';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Report {
  id: string;
  created_at: string;
  laundry_code: string;
  laundry_name: string;
  machine_id: string;
  issue_type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

interface Laundry {
  id: string;
  code: string;
  name: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLaundry, setSelectedLaundry] = useState<string>('all');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchLaundries();
    fetchReports();
  }, [filter, dateRange, selectedLaundry]);

  const fetchLaundries = async () => {
    try {
      const { data, error } = await supabase
        .from('laundries')
        .select('id, code, name')
        .order('name');

      if (error) throw error;
      setLaundries(data || []);
    } catch (error) {
      console.error('Error fetching laundries:', error);
    }
  };

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedLaundry !== 'all') {
        query = query.eq('laundry_code', selectedLaundry);
      }

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrer les données en fonction de la période sélectionnée
      const filteredData = (data || []).filter(report => {
        const reportDate = parseISO(report.created_at);
        const now = new Date();
        
        switch (dateRange) {
          case 'week':
            return isWithinInterval(reportDate, {
              start: subDays(now, 7),
              end: now
            });
          case 'month':
            return isWithinInterval(reportDate, {
              start: subDays(now, 30),
              end: now
            });
          case 'year':
            return isWithinInterval(reportDate, {
              start: subDays(now, 365),
              end: now
            });
          default:
            return true;
        }
      }).filter(report => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          report.laundry_name.toLowerCase().includes(searchLower) ||
          report.machine_id.toLowerCase().includes(searchLower) ||
          report.issue_type.toLowerCase().includes(searchLower) ||
          report.description.toLowerCase().includes(searchLower)
        );
      });

      setReports(filteredData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Laverie', 'Machine', 'Problème', 'Description', 'Statut', 'Priorité'];
    const csvData = reports.map(report => [
      format(parseISO(report.created_at), 'dd/MM/yyyy HH:mm'),
      report.laundry_name,
      report.machine_id,
      report.issue_type,
      report.description,
      report.status,
      report.priority
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `signalements_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#99E5DC]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Signalements</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#111313] rounded-lg p-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-gray-400 focus:outline-none"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">365 derniers jours</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#111313] rounded-lg p-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-gray-400 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
            </select>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#99E5DC] text-[#1E201F] rounded-lg hover:bg-[#7BC5BC] transition-colors"
          >
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Onglets des laveries */}
        <div className="flex items-center gap-4 border-b border-gray-800">
          <button
            onClick={() => setSelectedLaundry('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              selectedLaundry === 'all' 
                ? 'text-[#99E5DC]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Toutes les laveries
            {selectedLaundry === 'all' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#99E5DC]" />
            )}
          </button>
          {laundries.map((laundry) => (
            <button
              key={laundry.code}
              onClick={() => setSelectedLaundry(laundry.code)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                selectedLaundry === laundry.code 
                  ? 'text-[#99E5DC]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {laundry.name}
              {selectedLaundry === laundry.code && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#99E5DC]" />
              )}
            </button>
          ))}
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un signalement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#111313] text-white rounded-lg border border-gray-800 focus:border-[#99E5DC] focus:outline-none"
          />
        </div>

        {/* Liste des signalements */}
        <div className="grid gap-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Aucun signalement trouvé pour cette période
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-[#111313] rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-medium">{report.laundry_name}</span>
                      <span className="text-sm text-gray-400">{report.laundry_code}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Machine: {report.machine_id} • Signalé le{' '}
                      {format(parseISO(report.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'pending' ? 'bg-yellow-900/50 text-yellow-500' :
                        report.status === 'in_progress' ? 'bg-blue-900/50 text-blue-500' :
                        'bg-green-900/50 text-green-500'
                      }`}
                    >
                      {report.status === 'pending' ? 'En attente' :
                       report.status === 'in_progress' ? 'En cours' :
                       'Résolu'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        report.priority === 'high' ? 'bg-red-900/50 text-red-500' :
                        report.priority === 'medium' ? 'bg-orange-900/50 text-orange-500' :
                        'bg-green-900/50 text-green-500'
                      }`}
                    >
                      {report.priority === 'high' ? 'Urgent' :
                       report.priority === 'medium' ? 'Moyen' :
                       'Faible'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">{report.issue_type}</h3>
                  <p className="text-gray-400">{report.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
