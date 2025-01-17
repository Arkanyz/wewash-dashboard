import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface InfoRequestStats {
  totalRequests: number;
  averageResolutionTime: string;
  satisfactionRate: number;
  requests: any[];
}

export function InfoRequestsTab() {
  const [stats, setStats] = useState<InfoRequestStats>({
    totalRequests: 0,
    averageResolutionTime: '0m',
    satisfactionRate: 0,
    requests: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: requests } = await supabase
        .from('support_calls')
        .select(`
          *,
          laundries (name, address),
          machines (number, type)
        `)
        .eq('category', 'information_request')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (requests) {
        const totalTime = requests.reduce((acc, req) => acc + (req.duration || 0), 0);
        const avgTime = requests.length > 0 ? totalTime / requests.length : 0;
        
        // Calculer le taux de satisfaction basé sur l'analyse des appels
        const satisfiedCalls = requests.filter(req => 
          req.analysis?.sentiment === 'positive' || 
          req.analysis?.resolution_status === 'resolved'
        ).length;
        
        const satisfactionRate = requests.length > 0 
          ? (satisfiedCalls / requests.length) * 100 
          : 0;

        setStats({
          totalRequests: requests.length,
          averageResolutionTime: formatTime(avgTime),
          satisfactionRate: Math.round(satisfactionRate),
          requests
        });
      }
    };

    fetchData();
    
    const subscription = supabase
      .channel('info_requests_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_calls',
          filter: 'category=eq.information_request'
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

  return (
    <div className="p-6 space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total des demandes (24h)</p>
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Temps moyen de résolution</p>
              <p className="text-2xl font-bold">{stats.averageResolutionTime}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux de satisfaction</p>
              <p className="text-2xl font-bold">{stats.satisfactionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Demandes d'information</h2>
        </div>
        <div className="divide-y">
          {stats.requests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {request.laundries?.name} - Machine {request.machines?.number}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {request.analysis?.summary || 'Pas de résumé disponible'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(request.created_at), { 
                        locale: fr, 
                        addSuffix: true 
                      })}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      Durée: {formatTime(request.duration || 0)}
                    </span>
                    {request.analysis?.sentiment === 'positive' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Client satisfait
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Information
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
