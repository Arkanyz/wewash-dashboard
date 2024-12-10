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
    activeAgents: 3
  });

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const credentials = {
      username: formData.get('username') as string,
      password: formData.get('password') as string
    };

    try {
      await weLineService.login(credentials);
      setIsConnected(true);
      // Simuler des données pour la démo
      const mockData = Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        calls: Math.floor(Math.random() * 10),
        duration: Math.floor(Math.random() * 10) + 2
      }));

      setCallData(mockData);
      setStats({
        totalCalls: mockData.reduce((acc, curr) => acc + curr.calls, 0),
        avgDuration: Math.round(mockData.reduce((acc, curr) => acc + (curr.duration || 0), 0) / mockData.length),
        trend: 12.5,
        activeAgents: 3
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

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

  const MachinesList = () => (
    <div className="mt-6 bg-[#1A1D1D] p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Liste des machines</h3>
      <ul>
        <li>Machine 1</li>
        <li>Machine 2</li>
        <li>Machine 3</li>
      </ul>
    </div>
  );

  const LoginForm = () => (
    <div className="relative z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#99E5DC] to-transparent opacity-5 blur-xl pointer-events-none" />
      <form onSubmit={handleConnect} className="relative space-y-4">
        <div>
          <label htmlFor="username">Identifiant We-Line</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Votre identifiant"
            className="mt-1 block w-full px-3 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:outline-none focus:border-[#99E5DC]"
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Votre mot de passe"
              className="block w-full px-3 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:outline-none focus:border-[#99E5DC] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              <Lock className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isConnecting}
          className="w-full py-2 bg-[#99E5DC] text-black rounded-lg font-medium hover:bg-[#7AC4BB] transition-colors disabled:opacity-50"
        >
          {isConnecting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Connexion en cours...</span>
            </div>
          ) : (
            'Se connecter à We-Line'
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </form>
    </div>
  );

  // Nettoyer les ressources lors du démontage du composant
  useEffect(() => {
    return () => {
      if (isConnected) {
        weLineService.logout();
      }
    };
  }, [isConnected]);

  return (
    <div className="bg-[#111313] rounded-xl p-6 text-white h-full relative overflow-hidden">
      <WeLineAnimation />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">We-Line Analytics</h2>
            <p className="text-gray-400 text-sm">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1D1D] text-[#99E5DC] rounded-lg">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">En ligne</span>
            </div>
          )}
        </div>

        {!isConnected ? (
          <LoginForm />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                icon={Phone}
                label="Appels aujourd'hui"
                value={stats.totalCalls}
                trend={stats.trend}
              />
              <StatCard
                icon={Clock}
                label="Durée moyenne"
                value={stats.avgDuration}
                suffix="min"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Activité des appels</h3>
              <div className="space-y-2">
                {callData.slice(-6).map((data, index) => (
                  <TimelineItem key={index} time={data.time} calls={data.calls} />
                ))}
              </div>
            </div>

            <MachinesList />

            <div className="mt-6 bg-[#1A1D1D] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Agents actifs</h3>
                <span className="text-[#99E5DC] text-sm font-medium">{stats.activeAgents}</span>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: stats.activeAgents }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-[#252827] rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#99E5DC]" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeLineWidget;
