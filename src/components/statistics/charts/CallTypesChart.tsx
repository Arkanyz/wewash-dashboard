import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '../../../lib/supabaseClient';
import { CALL_CATEGORIES } from '../../../types/callTypes';

const COLORS = {
  technical_issue: '#EF4444', // Rouge pour les problèmes techniques
  payment_issue: '#10B981',   // Vert pour les problèmes de paiement
  user_experience: '#3B82F6', // Bleu pour l'expérience utilisateur
  environmental: '#8B5CF6',   // Violet pour les problèmes environnementaux
  general_inquiry: '#F59E0B', // Orange pour les questions générales
  other: '#6B7280'           // Gris pour autres
};

const CallTypesChart: React.FC = () => {
  const [data, setData] = useState<Array<{
    name: string;
    value: number;
    color: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: counts, error } = await supabase
          .from('support_calls')
          .select('category')
          .not('category', 'is', null);

        if (error) throw error;

        // Compter les occurrences de chaque catégorie
        const categoryCounts = counts.reduce((acc, { category }) => {
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Transformer en format pour le graphique
        const chartData = Object.entries(CALL_CATEGORIES).map(([key, label]) => ({
          name: label,
          value: categoryCounts[key] || 0,
          color: COLORS[key as keyof typeof COLORS]
        }));

        setData(chartData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Chargement...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CallTypesChart;
