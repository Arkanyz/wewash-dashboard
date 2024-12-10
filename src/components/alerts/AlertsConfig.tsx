import React, { useState } from 'react';
import { Bell, Mail, Phone, Plus, X } from 'lucide-react';

const AlertsConfig: React.FC = () => {
  const [emailRecipients, setEmailRecipients] = useState(['contact@example.com']);
  const [phoneRecipients, setPhoneRecipients] = useState(['+33 6 12 34 56 78']);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddEmail = () => {
    if (newEmail && !emailRecipients.includes(newEmail)) {
      setEmailRecipients([...emailRecipients, newEmail]);
      setNewEmail('');
    }
  };

  const handleAddPhone = () => {
    if (newPhone && !phoneRecipients.includes(newPhone)) {
      setPhoneRecipients([...phoneRecipients, newPhone]);
      setNewPhone('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email));
  };

  const handleRemovePhone = (phone: string) => {
    setPhoneRecipients(phoneRecipients.filter(p => p !== phone));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Configuration des Alertes</h3>
        <p className="text-sm text-gray-400 mb-6">
          Personnalisez vos notifications pour rester informé des événements importants.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium">Machine Bloquée</h4>
              <p className="text-sm text-gray-400">
                Notification immédiate quand une machine est bloquée pendant plus de 30 minutes.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Email</button>
              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Push</button>
              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">SMS</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium">Erreur de Paiement</h4>
              <p className="text-sm text-gray-400">
                Alerte lors d'un problème avec le système de paiement.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Email</button>
              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Push</button>
              <button className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">SMS</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium">Maintenance Préventive</h4>
              <p className="text-sm text-gray-400">
                Rappel pour la maintenance programmée des machines.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Email</button>
              <button className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">Push</button>
              <button className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">SMS</button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Destinataires email
            </label>
            <div className="space-y-3">
              {emailRecipients.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between px-4 py-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{email}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ajouter un email"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddEmail}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Destinataires SMS
            </label>
            <div className="space-y-3">
              {phoneRecipients.map((phone) => (
                <div
                  key={phone}
                  className="flex items-center justify-between px-4 py-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span>{phone}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePhone(phone)}
                    className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Ajouter un numéro"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddPhone}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsConfig;
