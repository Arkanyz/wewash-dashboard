import React, { useState } from "react";
import { Phone, CheckCircle, AlertTriangle, AlertCircle, Trash2, Edit, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import Modal from "../ui/Modal";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface DashboardStatsProps {
  className?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState({
    total_calls: { total_count: 0, percentage_change: 0 },
    info: { total_count: 0, percentage_change: 0 },
    issues: { total_count: 0, percentage_change: 0 },
    critical: { total_count: 0, absolute_change: 0 }
  });

  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      const { data: statsData, error } = await supabase
        .rpc('get_dashboard_statistics');

      if (!error && statsData) {
        setStats(statsData);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 300000);

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (statType: string) => {
    setSelectedStat(statType);
    if (statType === 'critical') {
      fetchNotes();
    }
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('incident_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    const { data, error } = await supabase
      .from('incident_notes')
      .insert([
        { content: newNote }
      ]);

    if (!error) {
      setNewNote("");
      fetchNotes();
    }
  };

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from('incident_notes')
      .delete()
      .eq('id', noteId);

    if (!error) {
      fetchNotes();
    }
  };

  const updateNote = async (noteId: string, content: string) => {
    const { error } = await supabase
      .from('incident_notes')
      .update({ content })
      .eq('id', noteId);

    if (!error) {
      setEditingNote(null);
      fetchNotes();
    }
  };

  const getModalContent = (statType: string) => {
    const stat = stats[statType as keyof typeof stats];
    
    if (statType === 'critical') {
      return (
        <div className="relative bg-[rgba(255,255,255,0.6)] backdrop-blur-2xl p-12 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2),0_30px_60px_-30px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)] min-h-[500px] border border-white/50">
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-[2.5rem] pointer-events-none"></div>
          
          {/* En-tête style Apple */}
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center gap-6">
              <div className="relative p-5 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent rounded-[1.5rem] shadow-[0_15px_30px_-8px_rgba(239,68,68,0.15)] border border-red-500/20 backdrop-blur-xl group-hover:shadow-[0_20px_40px_-12px_rgba(239,68,68,0.25)] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 rounded-[1.5rem]"></div>
                <AlertCircle className="relative w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-[1.7rem] font-semibold text-gray-900 tracking-tight">Incident Prioritaire</h2>
            </div>
            <div className="flex items-center gap-12">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 mb-2">Total actuel</p>
                <p className="text-[2rem] font-semibold text-gray-900 tracking-tight leading-none">{stat.total_count}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 mb-2">Évolution</p>
                <p className="text-[2rem] font-semibold text-gray-900 tracking-tight leading-none">{stat.absolute_change}</p>
              </div>
            </div>
          </div>

          {/* Section des notes */}
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[0.95rem] font-semibold text-gray-900 tracking-tight">Notes d'incidents</h3>
              <button
                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-300 rounded-2xl hover:bg-black/[0.03] active:bg-black/[0.06] hover:shadow-sm"
              >
                {isNotesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Ajout de note */}
            <div className="relative group">
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/0 via-blue-500/[0.08] to-blue-500/0 rounded-[1.2rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="relative w-full pl-6 pr-36 py-[0.85rem] bg-black/[0.02] border border-black/[0.06] rounded-[1.2rem] text-[0.95rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_0_0_4px_rgba(59,130,246,0.1)] outline-none transition-all duration-300 placeholder:text-gray-400"
              />
              <button
                onClick={addNote}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-500 text-white text-[0.925rem] font-medium rounded-[0.9rem] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(59,130,246,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1),0_12px_24px_rgba(59,130,246,0.15)] active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Ajouter
              </button>
            </div>

            {/* Liste des notes */}
            {isNotesExpanded && (
              <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="group relative p-6 bg-black/[0.02] backdrop-blur-xl border border-black/[0.04] rounded-[1.2rem] hover:shadow-[0_15px_30px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-0.5"
                  >
                    <div className="absolute -inset-px bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 rounded-[1.2rem] transition-all duration-500 pointer-events-none"></div>
                    {editingNote === note.id ? (
                      <div className="flex gap-4">
                        <input
                          type="text"
                          defaultValue={note.content}
                          className="flex-1 px-4 py-2.5 bg-white rounded-[1rem] text-[0.95rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_0_0_3px_rgba(59,130,246,0.1)] outline-none transition-all duration-300"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateNote(note.id, e.currentTarget.value);
                            }
                          }}
                        />
                        <button
                          onClick={() => setEditingNote(null)}
                          className="px-5 py-2 text-[0.925rem] text-gray-500 hover:text-gray-700 rounded-[0.9rem] hover:bg-white/80 active:bg-white transition-all duration-300"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex items-start justify-between group">
                          <p className="text-[0.95rem] text-gray-700 leading-relaxed">{note.content}</p>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() => setEditingNote(note.id)}
                              className="p-2.5 text-gray-400 hover:text-blue-500 rounded-xl hover:bg-white/90 active:bg-white transition-all duration-300"
                            >
                              <Edit className="w-[1.1rem] h-[1.1rem]" />
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl hover:bg-white/90 active:bg-white transition-all duration-300"
                            >
                              <Trash2 className="w-[1.1rem] h-[1.1rem]" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                          {new Date(note.createdAt).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Design pour les autres statistiques
    const colors = {
      total_calls: {
        icon: <Phone className="relative w-7 h-7 text-blue-500" />,
        gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
        border: 'border-blue-500/20',
        shadow: 'shadow-[0_15px_30px_-8px_rgba(59,130,246,0.15)]',
        hoverShadow: 'group-hover:shadow-[0_20px_40px_-12px_rgba(59,130,246,0.25)]'
      },
      info: {
        icon: <CheckCircle className="relative w-7 h-7 text-emerald-500" />,
        gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        border: 'border-emerald-500/20',
        shadow: 'shadow-[0_15px_30px_-8px_rgba(16,185,129,0.15)]',
        hoverShadow: 'group-hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.25)]'
      },
      issues: {
        icon: <AlertTriangle className="relative w-7 h-7 text-orange-500" />,
        gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
        border: 'border-orange-500/20',
        shadow: 'shadow-[0_15px_30px_-8px_rgba(249,115,22,0.15)]',
        hoverShadow: 'group-hover:shadow-[0_20px_40px_-12px_rgba(249,115,22,0.25)]'
      }
    };

    const currentColor = colors[statType as keyof typeof colors];

    return (
      <div className="relative bg-[rgba(255,255,255,0.6)] backdrop-blur-2xl p-12 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2),0_30px_60px_-30px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)] min-h-[500px] border border-white/50">
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-[2.5rem] pointer-events-none"></div>
        
        {/* En-tête style Apple */}
        <div className="flex items-center justify-between mb-14">
          <div className="flex items-center gap-6">
            <div className={`relative p-5 bg-gradient-to-br ${currentColor.gradient} rounded-[1.5rem] ${currentColor.shadow} border ${currentColor.border} backdrop-blur-xl ${currentColor.hoverShadow} transition-all duration-500`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 rounded-[1.5rem]"></div>
              {currentColor.icon}
            </div>
            <h2 className="text-[1.7rem] font-semibold text-gray-900 tracking-tight">
              {statType === 'total_calls' ? 'Total des appels' :
               statType === 'info' ? 'Demandes info + Cas traités' :
               'Problèmes signalés'}
            </h2>
          </div>
          <div className="flex items-center gap-12">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 mb-2">Total actuel</p>
              <p className="text-[2rem] font-semibold text-gray-900 tracking-tight leading-none">{stat.total_count}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 mb-2">Évolution</p>
              <p className={`text-[2rem] font-semibold tracking-tight leading-none ${
                stat.percentage_change >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stat.percentage_change >= 0 ? '+' : ''}{stat.percentage_change}%
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 gap-8 mb-14">
          <div className="group relative p-8 bg-black/[0.02] backdrop-blur-xl border border-black/[0.04] rounded-[1.2rem] shadow-[0_15px_30px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 rounded-[1.2rem] transition-all duration-500"></div>
            <p className="text-sm font-medium text-gray-500 mb-3">Moyenne quotidienne</p>
            <p className="relative text-[2rem] font-semibold text-gray-900 tracking-tight leading-none">
              {Math.round(stat.total_count / 30)}
            </p>
          </div>
          <div className="group relative p-8 bg-black/[0.02] backdrop-blur-xl border border-black/[0.04] rounded-[1.2rem] shadow-[0_15px_30px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 rounded-[1.2rem] transition-all duration-500"></div>
            <p className="text-sm font-medium text-gray-500 mb-3">Taux de variation</p>
            <p className={`relative text-[2rem] font-semibold tracking-tight leading-none ${
              stat.percentage_change >= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {stat.percentage_change >= 0 ? '+' : ''}{stat.percentage_change}%
            </p>
          </div>
        </div>

        {/* Graphique */}
        <div>
          <h3 className="text-[0.95rem] font-semibold text-gray-900 tracking-tight mb-6">Tendances sur 24h</h3>
          <div className="group relative bg-black/[0.02] backdrop-blur-xl border border-black/[0.04] rounded-[1.2rem] h-[240px] shadow-[0_15px_30px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 rounded-[1.2rem] transition-all duration-500"></div>
            <p className="relative text-sm text-gray-400">Graphique des tendances à venir</p>
          </div>
        </div>
      </div>
    );
  };

  const statCards = [
    {
      type: 'total_calls',
      title: 'Total des appels',
      value: stats.total_calls.total_count,
      change: `${stats.total_calls.percentage_change}%`,
      icon: <Phone className="w-8 h-8" />,
      color: 'bg-blue-500'
    },
    {
      type: 'info',
      title: 'Demandes info + Cas traités',
      value: stats.info.total_count,
      change: `${stats.info.percentage_change}%`,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'bg-green-500'
    },
    {
      type: 'issues',
      title: 'Problèmes signalés',
      value: stats.issues.total_count,
      change: `${stats.issues.percentage_change}%`,
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'bg-orange-500'
    },
    {
      type: 'critical',
      title: 'Incident Prioritaire',
      value: stats.critical.total_count,
      change: stats.critical.absolute_change.toString(),
      icon: <AlertCircle className="w-8 h-8" />,
      color: 'bg-red-500'
    }
  ];

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(stat.type)}
            className="relative overflow-hidden bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_10px_50px_rgba(8,_112,_184,_0.07)] hover:shadow-[0_20px_70px_rgba(8,_112,_184,_0.2)] transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className={`p-4 ${stat.color} rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`flex items-center px-2 py-1 rounded-full transition-colors duration-300 ${
                    !stat.change.startsWith('-') 
                      ? 'bg-emerald-100/80 group-hover:bg-emerald-100' 
                      : 'bg-red-100/80 group-hover:bg-red-100'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      !stat.change.startsWith('-') ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={selectedStat !== null}
        onClose={() => {
          setSelectedStat(null);
          setNewNote("");
          setEditingNote(null);
        }}
        title=""
      >
        {selectedStat && getModalContent(selectedStat)}
      </Modal>
    </>
  );
};
