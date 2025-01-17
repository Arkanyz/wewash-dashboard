import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, Clock, AlertOctagon } from 'lucide-react';

interface CriticalStats {
  totalIncidents: number;
  averageResponseTime: string;
  activeIncidents: number;
  incidents: any[];
}

export function CriticalTab() {
  const [stats, setStats] = useState<CriticalStats>({
    totalIncidents: 0,
    averageResponseTime: '0m',
    activeIncidents: 0,
    incidents: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: incidents } = await supabase
        .from('support_calls')
        .select(`
          *,
          laundries (name, address),
          machines (number, type)
        `)
        .eq('category', 'critical_incident')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (incidents) {
        const activeIncidents = incidents.filter(inc => inc.status !== 'resolved').length;
        const totalTime = incidents.reduce((acc, inc) => acc + (inc.response_time || 0), 0);
        const avgTime = incidents.length > 0 ? totalTime / incidents.length : 0;

        setStats({
          totalIncidents: incidents.length,
          averageResponseTime: formatTime(avgTime),
          activeIncidents,
          incidents
        });
      }
    };

    fetchData();
    
    const subscription = supabase
      .channel('critical_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_calls',
          filter: 'category=eq.critical_incident'
        }, 
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'Résolu';
      case 'in_progress':
        return 'En cours';
      default:
        return 'Non traité';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Incidents critiques (24h)</p>
              <p className="text-2xl font-bold">{stats.totalIncidents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Temps de réponse moyen</p>
              <p className="text-2xl font-bold">{stats.averageResponseTime}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <AlertOctagon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Incidents actifs</p>
              <p className="text-2xl font-bold">{stats.activeIncidents}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des incidents */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Incidents critiques</h2>
        </div>
        <div className="divide-y">
          {stats.incidents.map((incident) => (
            <div key={incident.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {incident.laundries?.name} - Machine {incident.machines?.number}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(incident.status)}`}>
                      {getStatusText(incident.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {incident.analysis?.summary || 'Pas de résumé disponible'}
                  </p>
                  {incident.analysis?.recommended_action && (
                    <p className="text-sm text-orange-600 mt-1">
                      Action recommandée : {incident.analysis.recommended_action}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(incident.created_at), { 
                        locale: fr, 
                        addSuffix: true 
                      })}
                    </span>
                    {incident.response_time && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        Temps de réponse: {formatTime(incident.response_time)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                  Critique
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
