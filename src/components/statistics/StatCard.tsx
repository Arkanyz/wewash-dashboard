import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  change: string;
  color: string;
  category: 'total' | 'info' | 'problem' | 'critical';
  details: {
    average_time: number;
    resolution_rate: number;
    calls: any[];
  };
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  change, 
  color,
  category,
  details 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (minutes: number): string => {
    if (!minutes) return '0m';
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
    <>
      <Card
        className={`p-4 cursor-pointer hover:shadow-lg transition-shadow`}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-600">{title}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{value}</span>
              <span className={`text-sm ${change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                {change}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}
              <span>{title}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Statistiques en en-tête */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Temps moyen</p>
                  <p className="text-xl font-bold">{formatTime(details.average_time)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Taux de résolution</p>
                  <p className="text-xl font-bold">{Math.round(details.resolution_rate)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Total (24h)</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Liste des appels */}
          <div className="space-y-4">
            {details.calls?.map((call) => (
              <Card key={call.id} className="p-4">
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
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(call.status)}`}>
                        {getStatusText(call.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
