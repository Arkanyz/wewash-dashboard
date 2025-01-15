import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IncidentModal } from '../incidents/IncidentModal';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  change: string;
  color: string;
  query: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, color, query }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(query.split('?')[0])
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) {
        setDetails(data);
        if (title === 'Incident Prioritaire' && data.length > 0) {
          setSelectedIncident(data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    setIsOpen(true);
    await fetchDetails();
  };

  const getGradientColor = () => {
    switch (color) {
      case 'bg-blue-500':
        return 'from-blue-400 to-blue-600';
      case 'bg-green-500':
        return 'from-green-400 to-green-600';
      case 'bg-orange-500':
        return 'from-orange-400 to-orange-600';
      case 'bg-red-500':
        return 'from-red-400 to-red-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'bg-blue-500':
        return 'text-blue-600';
      case 'bg-green-500':
        return 'text-green-600';
      case 'bg-orange-500':
        return 'text-orange-600';
      case 'bg-red-500':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const isPositiveChange = !change.startsWith('-');
  const isIncidentCard = title === 'Incident Prioritaire';

  return (
    <>
      <button 
        onClick={handleClick}
        className="bg-white rounded-2xl p-6 shadow-[0_10px_50px_rgba(8,_112,_184,_0.7)] hover:shadow-[0_20px_70px_rgba(8,_112,_184,_0.2)] transform hover:-translate-y-1 transition-all duration-300 w-full text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`p-4 bg-gradient-to-br ${getGradientColor()} rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform flex-shrink-0`}>
            <div className="w-8 h-8 text-white">
              {icon}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()} leading-tight line-clamp-2 h-10`}>{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className={`text-3xl font-bold ${getTextColor()}`}>{value}</p>
              <div className={`flex items-center px-2 py-1 rounded-full ${isPositiveChange ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <span className={`text-sm font-semibold ${isPositiveChange ? 'text-emerald-600' : 'text-red-600'}`}>
                  {change}
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>

      {isIncidentCard ? (
        <IncidentModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedIncident(null);
          }}
          incident={selectedIncident}
        />
      ) : (
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-b from-[#011330] to-[#012461] p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-br ${getGradientColor()} rounded-xl`}>
                        {icon}
                      </div>
                      <span>{title} - Détails</span>
                    </Dialog.Title>

                    <div className="mt-4">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                          <p className="text-white mt-2">Chargement...</p>
                        </div>
                      ) : details.length > 0 ? (
                        <div className="space-y-4">
                          {details.map((item, index) => (
                            <div
                              key={index}
                              className="p-4 bg-white/5 rounded-lg text-white/90 cursor-pointer hover:bg-white/10 transition-colors"
                              onClick={() => {
                                if (isIncidentCard) {
                                  setSelectedIncident(item);
                                  setIsOpen(true);
                                }
                              }}
                            >
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(item).map(([key, value]) => (
                                  key !== 'id' && (
                                    <div key={key} className="flex flex-col">
                                      <span className="text-sm text-white/60">{key}</span>
                                      <span className="text-white">
                                        {key.includes('created_at') || key.includes('resolved_at')
                                          ? value
                                            ? format(new Date(value as string), 'PPP à HH:mm', { locale: fr })
                                            : '-'
                                          : String(value)}
                                      </span>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white text-center py-8">Aucune donnée disponible</p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-900/20 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900/30 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Fermer
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
};
