import React, { useState, useEffect } from 'react';
import { Phone, Clock, Users, Activity, ChevronUp, ChevronDown, Lock, Loader2 } from 'lucide-react';
import WeLineAnimation from './WeLineAnimation';
import MachinesList from './MachinesList';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { weLineService } from '../../services/weline';

interface CallData {
  time: string;
  calls: number;
  duration?: number;
}

const WeLineWidget: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate] = useState<Date>(new Date());
  const [callData, setCallData] = useState<CallData[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    avgDuration: 0,
    trend: 0,
    activeAgents: 0
  });

  const loadCallData = async () => {
    try {
      const data = await weLineService.getCallsData(selectedDate);
      setCallData(data);
      
      // Calculer les statistiques à partir des vraies données
      const totalCalls = data.reduce((acc, curr) => acc + curr.calls, 0);
      const avgDuration = data.reduce((acc, curr) => acc + (curr.duration || 0), 0) / data.length;
      
      setStats(prev => ({
        ...prev,
        totalCalls,
        avgDuration: Math.round(avgDuration),
        // Note: trend et activeAgents seront mis à jour par d'autres appels API
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const credentials = {
      username: formData.get('email') as string,
      password: formData.get('password') as string
    };

    if (!credentials.username || !credentials.password) {
      setError('Veuillez remplir tous les champs');
      setIsConnecting(false);
      return;
    }

    console.log('Tentative de connexion avec:', credentials);

    try {
      await weLineService.login(credentials);
      setIsConnected(true);
      await loadCallData(); // Charger les vraies données après la connexion
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error instanceof Error ? error.message : 'Erreur de connexion à We-Line');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Mettre à jour les données toutes les minutes
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(loadCallData, 60000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const StatCard = ({ icon: Icon, label, value, trend, suffix = '' }: any) => (
    <div className="bg-[#1A1D1D] p-4 rounded-lg flex items-center gap-4">
      <div className="bg-[#252827] p-3 rounded-lg">
        <Icon className="w-5 h-5 text-[#99E5DC]" />
      </div>
      <div className="flex-1">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold text-white">{value}{suffix}</p>
          {trend !== undefined && (
            <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TimelineItem = ({ time, calls }: { time: string; calls: number }) => (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400 w-12">{time}</span>
      <div className="flex-1 h-1 bg-[#1A1D1D] rounded">
        <div 
          className="h-full bg-[#99E5DC] rounded" 
          style={{ width: `${(calls / 10) * 100}%` }}
        />
      </div>
      <span className="text-white w-8 text-right">{calls}</span>
    </div>
  );

  return (
    <div className="bg-[#141616] text-white p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">We-Line Analytics</h2>
        <p className="text-gray-400">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</p>
      </div>

      {!isConnected ? (
        <form onSubmit={handleConnect} className="max-w-sm mx-auto space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Votre adresse e-mail"
              className="w-full px-4 py-2 bg-[#1A1D1D] border border-[#252827] rounded-lg focus:outline-none focus:border-[#99E5DC]"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="Votre mot de passe"
                className="w-full px-4 py-2 bg-[#1A1D1D] border border-[#252827] rounded-lg focus:outline-none focus:border-[#99E5DC]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-[#99E5DC] text-[#141616] py-2 rounded-lg font-medium hover:bg-[#7AC7BE] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Se connecter à We-Line'
            )}
          </button>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Phone}
              label="Appels totaux"
              value={stats.totalCalls}
              trend={stats.trend}
            />
            <StatCard
              icon={Clock}
              label="Durée moyenne"
              value={stats.avgDuration}
              suffix="min"
            />
            <StatCard
              icon={Users}
              label="Agents actifs"
              value={stats.activeAgents}
            />
            <StatCard
              icon={Activity}
              label="Taux de réponse"
              value={98}
              suffix="%"
              trend={2.5}
            />
          </div>

          <div className="space-y-2">
            {callData.map((item, index) => (
              <TimelineItem key={index} time={item.time} calls={item.calls} />
            ))}
          </div>

          <MachinesList />
        </>
      )}
    </div>
  );
};

export default WeLineWidget;
