import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Wrench, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { MaintenanceAlert, MaintenanceEvent } from '../../types/maintenance';

interface MaintenanceAlertsProps {
  laundryId?: string; // Optional: filter by laundry
}

const MaintenanceAlerts: React.FC<MaintenanceAlertsProps> = ({ laundryId }) => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [predictions, setMaintPredictions] = useState<MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    fetchPredictions();
  }, [laundryId]);

  const fetchAlerts = async () => {
    const query = supabase
      .from('maintenance_alerts')
      .select('*')
      .is('resolved_at', null)
      .order('created_at', { ascending: false });

    if (laundryId) {
      query.eq('laundry_id', laundryId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setAlerts(data);
    }
  };

  const fetchPredictions = async () => {
    const query = supabase
      .from('maintenance_events')
      .select('*')
      .eq('type', 'preventive')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });

    if (laundryId) {
      query.eq('laundry_id', laundryId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setMaintPredictions(data);
    }
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'breakdown':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'prediction':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#286BD4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertes actives */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alertes actives ({alerts.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {getIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(alert.created_at).toLocaleDateString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-900">{alert.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Prédictions de maintenance */}
      {predictions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Maintenance préventive recommandée ({predictions.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {predictions.map((prediction) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 p-4"
                >
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-blue-600">
                          Maintenance préventive
                        </span>
                        {prediction.scheduled_for && (
                          <span className="text-sm text-gray-500">
                            Planifiée pour le {new Date(prediction.scheduled_for).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 mb-2">{prediction.description}</p>
                      {prediction.predicted_issue && (
                        <p className="text-sm text-gray-600">
                          Problème prédit : {prediction.predicted_issue}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {alerts.length === 0 && predictions.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">Aucune alerte ou maintenance préventive à signaler</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceAlerts;
