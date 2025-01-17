import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { monitoringService } from '../../services/monitoringService';
import { MachineStatus, AlertLevel, MonitoringMetrics, ROIAnalysis } from '../../types/monitoringTypes';
import { Card } from '../ui/card';
import { DataState } from '../ui/data-state';
import { Activity, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface MonitoringDashboardProps {
  laundryId: string;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ laundryId }) => {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [roiAnalysis, setRoiAnalysis] = useState<ROIAnalysis | null>(null);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 60000); // Rafraîchir toutes les minutes
    return () => clearInterval(interval);
  }, [laundryId]);

  useEffect(() => {
    if (selectedMachine) {
      fetchROIAnalysis(selectedMachine);
    }
  }, [selectedMachine]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const data = await monitoringService.getLaundryPerformance(laundryId);
      setPerformance(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la récupération des données de performance");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchROIAnalysis = async (machineId: string) => {
    try {
      const analysis = await monitoringService.calculateROI(machineId);
      setRoiAnalysis({
        machineId,
        currentValue: 0, // À calculer basé sur l'âge et l'état
        ...analysis,
        confidenceLevel: 0.85
      });
    } catch (err) {
      console.error('Erreur lors de l\'analyse ROI:', err);
    }
  };

  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-500';
    if (value >= threshold - 0.1) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <DataState
        isLoading={loading}
        error={error}
        isEmpty={!performance}
        loadingMessage="Chargement des données de monitoring..."
        emptyMessage="Aucune donnée de monitoring disponible"
        errorMessage={error || "Une erreur est survenue"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Performance Globale */}
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">OEE Global</h3>
                  <p className={`text-2xl font-bold ${getStatusColor(performance?.oee || 0, 0.85)}`}>
                    {((performance?.oee || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Disponibilité */}
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Disponibilité</h3>
                  <p className={`text-2xl font-bold ${getStatusColor(performance?.availability || 0, 0.9)}`}>
                    {((performance?.availability || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Qualité */}
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <AlertTriangle className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Qualité</h3>
                  <p className={`text-2xl font-bold ${getStatusColor(performance?.quality || 0, 0.95)}`}>
                    {((performance?.quality || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* ROI Projeté */}
          {roiAnalysis && (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-600">ROI Projeté</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {roiAnalysis.monthsToROI} mois
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {roiAnalysis.recommendation}
              </p>
            </Card>
          )}
        </div>

        {/* Recommandations Stratégiques */}
        {roiAnalysis && (
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Recommandations Stratégiques</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Économies projetées</p>
                  <p className="text-lg font-semibold">{roiAnalysis.projectedSavings.toFixed(2)}€ / an</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Niveau de confiance</p>
                  <p className="text-lg font-semibold">{(roiAnalysis.confidenceLevel * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700">{roiAnalysis.recommendation}</p>
              </div>
            </div>
          </Card>
        )}
      </DataState>
    </div>
  );
};

export default MonitoringDashboard;
