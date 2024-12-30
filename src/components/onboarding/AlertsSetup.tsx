import React, { useState } from 'react';
import { Bell, AlertTriangle, BellOff } from 'lucide-react';

interface AlertSetting {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info';
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

const defaultAlerts: AlertSetting[] = [
  {
    id: 'machine-blocked',
    title: 'Machine Bloquée',
    description: 'Notification immédiate quand une machine est bloquée pendant plus de 30 minutes.',
    type: 'critical',
    enabled: true,
    channels: {
      email: true,
      push: true,
      sms: true
    }
  },
  {
    id: 'payment-error',
    title: 'Erreur de Paiement',
    description: 'Alerte lors d\'un problème avec le système de paiement.',
    type: 'critical',
    enabled: true,
    channels: {
      email: true,
      push: true,
      sms: false
    }
  },
  {
    id: 'maintenance',
    title: 'Maintenance Préventive',
    description: 'Rappel pour la maintenance programmée des machines.',
    type: 'warning',
    enabled: true,
    channels: {
      email: true,
      push: false,
      sms: false
    }
  }
];

interface AlertsSetupProps {
  onComplete: () => void;
}

const AlertsSetup: React.FC<AlertsSetupProps> = ({ onComplete }) => {
  const [alerts, setAlerts] = useState<AlertSetting[]>(defaultAlerts);

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, enabled: !alert.enabled }
          : alert
      )
    );
  };

  const handleToggleChannel = (alertId: string, channel: keyof AlertSetting['channels']) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              channels: {
                ...alert.channels,
                [channel]: !alert.channels[channel]
              }
            }
          : alert
      )
    );
  };

  const handleSave = () => {
    // Ici, vous pouvez sauvegarder les paramètres dans votre backend
    localStorage.setItem('alertSettings', JSON.stringify(alerts));
    onComplete();
  };

  return (
    <div className="bg-[#1A1C1A] p-6 rounded-lg max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Configuration des Alertes</h2>
        <p className="text-gray-400">
          Personnalisez vos notifications pour rester informé des événements importants.
        </p>
      </div>

      <div className="space-y-6">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${
              alert.enabled ? 'border-[#99E5DC]' : 'border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {alert.type === 'critical' ? (
                  <AlertTriangle className="text-red-500 mt-1" size={20} />
                ) : (
                  <Bell className="text-yellow-500 mt-1" size={20} />
                )}
                <div>
                  <h3 className="font-medium">{alert.title}</h3>
                  <p className="text-sm text-gray-400">{alert.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleAlert(alert.id)}
                className={`p-2 rounded-lg transition-colors ${
                  alert.enabled
                    ? 'bg-[#99E5DC] text-black'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {alert.enabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>
            </div>

            {alert.enabled && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleToggleChannel(alert.id, 'email')}
                  className={`px-3 py-1 text-sm rounded ${
                    alert.channels.email
                      ? 'bg-[#99E5DC] text-black'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => handleToggleChannel(alert.id, 'push')}
                  className={`px-3 py-1 text-sm rounded ${
                    alert.channels.push
                      ? 'bg-[#99E5DC] text-black'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  Push
                </button>
                <button
                  onClick={() => handleToggleChannel(alert.id, 'sms')}
                  className={`px-3 py-1 text-sm rounded ${
                    alert.channels.sms
                      ? 'bg-[#99E5DC] text-black'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  SMS
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#99E5DC] text-black rounded-lg hover:bg-opacity-90"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default AlertsSetup;
