import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, Plus, Send } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_by: string;
}

interface Incident {
  id: string;
  machine_id: string;
  description: string;
  severity: string;
  created_at: string;
  resolved_at: string | null;
  created_by: string;
  resolved_by: string | null;
}

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ isOpen, onClose, incident }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'resolved'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (incident) {
      fetchNotes();
    }
  }, [incident]);

  const fetchNotes = async () => {
    if (!incident) return;
    
    const { data, error } = await supabase
      .from('incident_notes')
      .select('*')
      .eq('incident_id', incident.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  };

  const addNote = async () => {
    if (!incident || !newNote.trim()) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('incident_notes')
      .insert({
        incident_id: incident.id,
        content: newNote.trim(),
        status: status
      });

    if (!error) {
      setNewNote('');
      await fetchNotes();
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                  <AlertCircle className="w-6 h-6" />
                  <span>Incident Prioritaire - Détails et Notes</span>
                </Dialog.Title>

                {incident ? (
                  <div className="mt-4">
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <h4 className="text-white font-medium mb-2">Détails de l'incident</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm">Créé le</p>
                          <p className="text-white">
                            {format(new Date(incident.created_at), 'PPP à HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Statut</p>
                          <p className="text-white">
                            {incident.resolved_at ? 'Résolu' : 'En cours'}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-white/60 text-sm">Description</p>
                          <p className="text-white">{incident.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                          <select
                            className="bg-white/10 text-white rounded-lg px-3 py-2 flex-1"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                          >
                            <option value="pending">En attente</option>
                            <option value="in_progress">En cours</option>
                            <option value="resolved">Résolu</option>
                          </select>
                          <button
                            onClick={addNote}
                            disabled={!newNote.trim() || isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                            <span>Ajouter</span>
                          </button>
                        </div>
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Ajouter une note..."
                          className="w-full bg-white/10 text-white rounded-lg p-3 min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-3 mt-4">
                        {notes.map((note) => (
                          <div key={note.id} className="bg-white/5 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(note.status)}`}>
                                {note.status === 'pending' ? 'En attente' : 
                                 note.status === 'in_progress' ? 'En cours' : 'Résolu'}
                              </span>
                              <span className="text-white/60 text-sm">
                                {format(new Date(note.created_at), 'PPP à HH:mm', { locale: fr })}
                              </span>
                            </div>
                            <p className="text-white whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-8">
                    <p className="text-white">Aucune donnée disponible</p>
                    <p className="text-white/60 text-sm mt-2">Il n'y a actuellement aucun incident prioritaire à afficher.</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-900/20 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900/30 transition-colors"
                    onClick={onClose}
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
  );
};
