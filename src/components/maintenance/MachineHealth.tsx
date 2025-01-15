import React from 'react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MachineHealth } from '../../types/maintenance';

interface MachineHealthProps {
  health: MachineHealth;
  machineName: string;
}

const MachineHealth: React.FC<MachineHealthProps> = ({ health, machineName }) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 50) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{machineName}</h3>
        <div className={`p-2 rounded-full ${getHealthBackground(health.health_score)}`}>
          <Activity className={`w-5 h-5 ${getHealthColor(health.health_score)}`} />
        </div>
      </div>

      {/* Score de santé */}
      <div className="relative pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Score de santé</span>
          <span className={`text-sm font-bold ${getHealthColor(health.health_score)}`}>
            {health.health_score}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getHealthBackground(health.health_score)}`}
            style={{ width: `${health.health_score}%` }}
          />
        </div>
      </div>

      {/* Dernière maintenance */}
      <div>
        <span className="text-sm text-gray-600 block mb-1">Dernière maintenance</span>
        <span className="text-sm font-medium text-gray-900">
          {new Date(health.last_maintenance).toLocaleDateString('fr-FR')}
        </span>
      </div>

      {/* Fréquence des pannes */}
      <div>
        <span className="text-sm text-gray-600 block mb-1">Fréquence des pannes</span>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-900">
            {health.failure_frequency} incidents / mois
          </span>
        </div>
      </div>

      {/* Problèmes prédits */}
      {health.predicted_issues.length > 0 && (
        <div>
          <span className="text-sm text-gray-600 block mb-2">Problèmes potentiels</span>
          <div className="space-y-2">
            {health.predicted_issues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm bg-yellow-50 rounded-lg p-3"
              >
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span className="text-yellow-800">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dernière mise à jour */}
      <div className="pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Dernière mise à jour : {new Date(health.last_updated).toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  );
};

export default MachineHealth;
