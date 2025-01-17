import React, { useState, useRef, useEffect } from 'react';
import FluidAnimation from './FluidAnimation';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useSupabase } from '@/providers/SupabaseProvider';
import { Send, Mic } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface MaintenanceTask {
  id: string;
  machine_id: string;
  type: 'preventive' | 'corrective';
  status: 'pending' | 'scheduled' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  due_date: string;
  completed_date?: string;
  created_at: string;
  machine: {
    name: string;
    laundry: {
      name: string;
      performance: {
        monthly_revenue: number;
        incident_rate: number;
        uptime: number;
      };
    };
  };
}

const AIPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { supabase } = useSupabase();

  // Mock data pour le développement
  const mockIncidents = [
    {
      id: '1',
      machine_id: 'WM-01',
      type: 'payment',
      status: 'resolved',
      description: 'Terminal de paiement hors service',
      created_at: '2024-12-09T14:30:00Z',
      laverie: 'Laverie Paris 11'
    },
    {
      id: '2',
      machine_id: 'WM-03',
      type: 'mechanical',
      status: 'pending',
      description: 'Bruit anormal pendant l\'essorage',
      created_at: '2024-12-09T15:15:00Z',
      laverie: 'Laverie Lyon 6'
    },
    {
      id: '3',
      machine_id: 'WM-01',
      type: 'payment',
      status: 'pending',
      description: 'Transactions refusées',
      created_at: '2024-12-09T16:00:00Z',
      laverie: 'Laverie Paris 11'
    }
  ];

  const mockMaintenanceTasks = [
    {
      id: '1',
      machine_id: 'WM-01',
      type: 'corrective',
      status: 'pending',
      priority: 'high',
      description: 'Remplacement terminal de paiement',
      due_date: '2024-12-10',
      created_at: '2024-12-09T14:30:00Z',
      machine: {
        name: 'Lave-linge 01',
        laundry: {
          name: 'Laverie Paris 11',
          performance: {
            monthly_revenue: 12500,
            incident_rate: 0.15,
            uptime: 0.85
          }
        }
      }
    },
    {
      id: '2',
      machine_id: 'WM-03',
      type: 'preventive',
      status: 'scheduled',
      priority: 'medium',
      description: 'Maintenance préventive mensuelle',
      due_date: '2024-12-15',
      created_at: '2024-12-08T10:00:00Z',
      machine: {
        name: 'Lave-linge 03',
        laundry: {
          name: 'Laverie Lyon 6',
          performance: {
            monthly_revenue: 9800,
            incident_rate: 0.08,
            uptime: 0.92
          }
        }
      }
    }
  ];

  const getMaintenanceTasks = async () => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMaintenanceTasks;
  };

  const getIncidents = async () => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockIncidents;
  };

  const handleQuickAction = async (action: string) => {
    setIsChatting(true);
    setIsLoading(true);
    let message = '';

    try {
      switch (action) {
        case 'recommendations': {
          const tasks = await getMaintenanceTasks();
          const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status === 'pending');
          
          message = "🎯 Actions Recommandées :\n\n";
          
          if (urgentTasks.length > 0) {
            message += "⚠️ Actions Prioritaires :\n";
            urgentTasks.forEach(task => {
              message += `- ${task.machine.laundry.name} | ${task.machine.name} : ${task.description}\n`;
              message += `  Impact estimé : -${Math.round(task.machine.laundry.performance.monthly_revenue * 0.15)}€/mois de revenus\n`;
            });
            message += "\nCliquez sur une action pour la planifier immédiatement.";
          } else {
            message += "✅ Aucune action urgente requise.\n\n";
            message += "Actions préventives suggérées :\n";
            message += "1. Vérification mensuelle des terminaux de paiement\n";
            message += "2. Inspection des joints et courroies\n";
            message += "3. Nettoyage des filtres";
          }
          break;
        }

        case 'optimization': {
          const incidents = await getIncidents();
          const tasks = await getMaintenanceTasks();
          
          message = "📈 Analyse des Opportunités d'Optimisation :\n\n";
          
          // Analyser les tendances par type d'incident
          const incidentsByType = incidents.reduce((acc, inc) => {
            acc[inc.type] = (acc[inc.type] || 0) + 1;
            return acc;
          }, {});

          // Analyser les pertes financières
          const paymentIssues = incidents.filter(inc => inc.type === 'payment').length;
          const estimatedLoss = paymentIssues * 150; // 150€ par incident de paiement

          message += "💡 Recommandations basées sur l'analyse :\n\n";
          
          if (paymentIssues > 1) {
            message += "1. Terminal de Paiement :\n";
            message += `   - ${paymentIssues} incidents de paiement détectés\n`;
            message += `   - Perte estimée : ${estimatedLoss}€\n`;
            message += "   ➡️ Recommandation : Mise à niveau du terminal de paiement\n\n";
          }

          const machineIssues = incidents.filter(inc => inc.type === 'mechanical');
          if (machineIssues.length > 0) {
            message += "2. Maintenance Préventive :\n";
            message += `   - ${machineIssues.length} incidents mécaniques détectés\n`;
            message += "   ➡️ Recommandation : Augmenter la fréquence des inspections\n\n";
          }

          // Analyser la performance par laverie
          const laveriePerf = tasks.reduce((acc, task) => {
            const laverie = task.machine.laundry;
            if (!acc[laverie.name]) {
              acc[laverie.name] = laverie.performance;
            }
            return acc;
          }, {});

          message += "3. Performance par Laverie :\n";
          Object.entries(laveriePerf).forEach(([name, perf]: [string, any]) => {
            message += `   ${name}:\n`;
            message += `   - Taux d'incidents : ${(perf.incident_rate * 100).toFixed(1)}%\n`;
            message += `   - Disponibilité : ${(perf.uptime * 100).toFixed(1)}%\n`;
            if (perf.incident_rate > 0.1) {
              message += "   ➡️ Action recommandée : Audit technique complet\n";
            }
          });
          break;
        }

        case 'history': {
          const incidents = await getIncidents();
          const tasks = await getMaintenanceTasks();
          
          message = "📊 Analyse des Performances :\n\n";
          
          // Statistiques générales
          const totalIncidents = incidents.length;
          const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
          const resolutionRate = (resolvedIncidents / totalIncidents * 100).toFixed(1);
          
          message += "1. Vue d'ensemble :\n";
          message += `- Incidents totaux : ${totalIncidents}\n`;
          message += `- Taux de résolution : ${resolutionRate}%\n\n`;
          
          // Analyse par type
          const typeStats = incidents.reduce((acc, inc) => {
            acc[inc.type] = (acc[inc.type] || 0) + 1;
            return acc;
          }, {});
          
          message += "2. Répartition par type :\n";
          Object.entries(typeStats).forEach(([type, count]) => {
            const percentage = (count as number / totalIncidents * 100).toFixed(1);
            message += `- ${type}: ${count} (${percentage}%)\n`;
          });
          
          message += "\n3. Derniers incidents résolus :\n";
          incidents
            .filter(i => i.status === 'resolved')
            .slice(0, 3)
            .forEach(incident => {
              message += `- ${incident.laverie} | ${incident.description}\n`;
            });
          
          break;
        }

        case 'intervention': {
          const tasks = await getMaintenanceTasks();
          const urgentTask = tasks.find(t => t.priority === 'high' && t.status === 'pending');
          
          if (urgentTask) {
            const estimatedImpact = Math.round(urgentTask.machine.laundry.performance.monthly_revenue * 0.15);
            
            message = `🚨 Intervention Prioritaire :\n\n`;
            message += `📍 Localisation : ${urgentTask.machine.laundry.name}\n`;
            message += `🔧 Machine : ${urgentTask.machine.name}\n`;
            message += `⚠️ Problème : ${urgentTask.description}\n`;
            message += `💶 Impact estimé : ${estimatedImpact}€/mois\n\n`;
            message += `Actions disponibles :\n`;
            message += `1. 📞 Contacter un technicien (délai : 2h)\n`;
            message += `2. ⚡ Désactiver la machine à distance\n`;
            message += `3. 📅 Planifier une intervention (prochain créneau : demain 9h)\n\n`;
            message += `Répondez avec le numéro de l'action souhaitée.`;
          } else {
            const nextMaintenance = tasks.find(t => t.status === 'scheduled');
            message = "✅ Aucune intervention urgente nécessaire\n\n";
            
            if (nextMaintenance) {
              message += `Prochaine maintenance prévue :\n`;
              message += `📅 Date : ${new Date(nextMaintenance.due_date).toLocaleDateString('fr-FR')}\n`;
              message += `📍 ${nextMaintenance.machine.laundry.name}\n`;
              message += `🔧 ${nextMaintenance.machine.name}\n`;
              message += `📋 ${nextMaintenance.description}\n\n`;
            }
            
            message += "Autres options :\n";
            message += "1. 📋 Planifier une maintenance préventive\n";
            message += "2. 🔍 Vérifier l'état des machines\n";
            message += "3. 📊 Consulter le planning complet";
          }
          break;
        }
      }

      // Ajouter le message de l'assistant à la conversation
      const assistantMessage: Message = {
        role: 'assistant',
        content: message,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveChatMessage(assistantMessage);

    } catch (error) {
      console.error('Error handling quick action:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, je n'ai pas pu récupérer les informations nécessaires. Veuillez réessayer.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveChatMessage(errorMessage);
    }

    setIsLoading(false);
    setInput('');
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data);
        if (data.length > 0) {
          setIsChatting(true);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (message: Message) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_id: user.id,
            role: message.role,
            content: message.content,
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newUserMessage = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    await saveChatMessage(newUserMessage);
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();
      const newAssistantMessage = { 
        role: 'assistant' as const, 
        content: data.response 
      };
      setMessages(prev => [...prev, newAssistantMessage]);
      await saveChatMessage(newAssistantMessage);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer."
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {isChatting ? (
        <div className="relative h-full flex flex-col">
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-grow p-4 space-y-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-200">
                  <div className="animate-pulse">En train de réfléchir...</div>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <FluidAnimation 
          onQuickAction={handleQuickAction}
          onStartChat={() => setIsChatting(true)}
        />
      )}
    </div>
  );
};

export default AIPanel;
