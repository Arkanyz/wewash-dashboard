import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';

interface ProblemStats {
  totalProblems: number;
  averageResolutionTime: string;
  commonIssues: { issue: string; count: number }[];
  problems: any[];
}

export function ProblemsTab() {
  const [stats, setStats] = useState<ProblemStats>({
    totalProblems: 0,
    averageResolutionTime: '0m',
    commonIssues: [],
    problems: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: problems } = await supabase
        .from('support_calls')
        .select(`
          *,
          laundries (name, address),
          machines (number, type)
        `)
        .eq('category', 'technical_issue')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (problems) {
        // Calculer le temps moyen de résolution
        const totalTime = problems.reduce((acc, prob) => acc + (prob.duration || 0), 0);
        const avgTime = problems.length > 0 ? totalTime / problems.length : 0;

        // Analyser les problèmes communs
        const issueTypes = problems.reduce((acc: { [key: string]: number }, prob) => {
          const issue = prob.analysis?.issue_type || 'Autre';
          acc[issue] = (acc[issue] || 0) + 1;
          return acc;
        }, {});

        const commonIssues = Object.entries(issueTypes)
          .map(([issue, count]) => ({ issue, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setStats({
          totalProblems: problems.length,
          averageResolutionTime: formatTime(avgTime),
          commonIssues,
          problems
        });
      }
    };

    fetchData();
    
    const subscription = supabase
      .channel('problems_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_calls',
          filter: 'category=eq.technical_issue'
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
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total des problèmes (24h)</p>
              <p className="text-2xl font-bold">{stats.totalProblems}</p>
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
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Problème le plus fréquent</p>
              <p className="text-2xl font-bold">
                {stats.commonIssues[0]?.issue || 'Aucun'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Problèmes communs */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Problèmes les plus fréquents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.commonIssues.map((issue, index) => (
            <Card key={index} className="p-4">
              <h3 className="font-medium">{issue.issue}</h3>
              <p className="text-2xl font-bold mt-2">{issue.count}</p>
              <p className="text-sm text-gray-600">occurrences</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Liste des problèmes */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Problèmes signalés</h2>
        </div>
        <div className="divide-y">
          {stats.problems.map((problem) => (
            <div key={problem.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {problem.laundries?.name} - Machine {problem.machines?.number}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {problem.analysis?.summary || 'Pas de résumé disponible'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(problem.created_at), { 
                        locale: fr, 
                        addSuffix: true 
                      })}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      Durée: {formatTime(problem.duration || 0)}
                    </span>
                    {problem.status === 'resolved' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Résolu
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                        En cours
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Problème technique
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
