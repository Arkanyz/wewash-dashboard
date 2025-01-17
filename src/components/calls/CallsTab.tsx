import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, TrendingUp, Phone } from 'lucide-react';

interface CallStats {
  totalCalls: number;
  averageTime: string;
  timeSaved: string;
  calls: any[];
}

export function CallsTab() {
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    averageTime: '0m',
    timeSaved: '0h',
    calls: []
  });

  useEffect(() => {
    const fetchData = async () => {
      // Récupérer les appels des dernières 24h
      const { data: calls } = await supabase
        .from('support_calls')
        .select(`
          *,
          laundries (name, address),
          machines (number, type)
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (calls) {
        // Calculer les statistiques
        const totalTime = calls.reduce((acc, call) => {
          const duration = call.duration || 0;
          return acc + duration;
        }, 0);

        const averageTime = calls.length > 0 ? totalTime / calls.length : 0;
        const timeSaved = totalTime * 0.4; // Estimation du temps gagné (40% plus rapide)

        setStats({
          totalCalls: calls.length,
          averageTime: formatTime(averageTime),
          timeSaved: formatTime(timeSaved),
          calls
        });
      }
    };

    fetchData();
    
    // Souscrire aux mises à jour en temps réel
    const subscription = supabase
      .channel('calls_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_calls' 
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
      {/* En-tête avec les statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total des appels (24h)</p>
              <p className="text-2xl font-bold">{stats.totalCalls}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Temps moyen par appel</p>
              <p className="text-2xl font-bold">{stats.averageTime}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gain de temps total</p>
              <p className="text-2xl font-bold">{stats.timeSaved}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des appels */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Historique des appels</h2>
        </div>
        <div className="divide-y">
          {stats.calls.map((call) => (
            <div key={call.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {call.laundries?.name} - Machine {call.machines?.number}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {call.analysis?.summary || 'Pas de résumé disponible'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(call.created_at), { 
                        locale: fr, 
                        addSuffix: true 
                      })}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      Durée: {formatTime(call.duration || 0)}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  call.category === 'information_request'
                    ? 'bg-green-100 text-green-800'
                    : call.category === 'technical_issue'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {call.category === 'information_request'
                    ? 'Information'
                    : call.category === 'technical_issue'
                    ? 'Problème'
                    : 'Critique'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
