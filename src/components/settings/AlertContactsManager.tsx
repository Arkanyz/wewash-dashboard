import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Trash2, Plus, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AlertContact {
  id: string;
  name: string;
  phone: string;
  role: 'primary' | 'technician' | 'manager';
  active: boolean;
}

interface AlertContactsManagerProps {
  laundryId: string;
}

const AlertContactsManager: React.FC<AlertContactsManagerProps> = ({ laundryId }) => {
  const [contacts, setContacts] = useState<AlertContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, [laundryId]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alert_contacts')
        .select('*')
        .eq('laundry_id', laundryId)
        .order('role', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (contact: Partial<AlertContact>) => {
    try {
      const { error } = await supabase
        .from('alert_contacts')
        .upsert({
          ...contact,
          laundry_id: laundryId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Contact sauvegardé avec succès');
      loadContacts();
      setEditing(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contact:', error);
      toast.error('Erreur lors de la sauvegarde du contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    try {
      const { error } = await supabase
        .from('alert_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Contact supprimé avec succès');
      loadContacts();
    } catch (error) {
      console.error('Erreur lors de la suppression du contact:', error);
      toast.error('Erreur lors de la suppression du contact');
    }
  };

  const handleAdd = () => {
    const newContact: Partial<AlertContact> = {
      name: '',
      phone: '',
      role: 'technician',
      active: true
    };
    setContacts([...contacts, newContact as AlertContact]);
    setEditing('new');
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des Contacts d'Alerte</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un contact
        </Button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div
            key={contact.id || index}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border"
          >
            {editing === contact.id ? (
              <>
                <Input
                  className="flex-1"
                  placeholder="Nom"
                  value={contact.name}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[index] = { ...contact, name: e.target.value };
                    setContacts(updated);
                  }}
                />
                <Input
                  className="flex-1"
                  placeholder="Téléphone"
                  value={contact.phone}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[index] = { ...contact, phone: e.target.value };
                    setContacts(updated);
                  }}
                />
                <Select
                  className="w-40"
                  value={contact.role}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[index] = {
                      ...contact,
                      role: e.target.value as AlertContact['role']
                    };
                    setContacts(updated);
                  }}
                >
                  <option value="primary">Principal</option>
                  <option value="technician">Technicien</option>
                  <option value="manager">Manager</option>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => handleSave(contact)}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </Button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                </div>
                <div className="w-32">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    contact.role === 'primary' ? 'bg-blue-100 text-blue-800' :
                    contact.role === 'technician' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {contact.role === 'primary' ? 'Principal' :
                     contact.role === 'technician' ? 'Technicien' :
                     'Manager'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(contact.id)}
                    className="p-2"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AlertContactsManager;
