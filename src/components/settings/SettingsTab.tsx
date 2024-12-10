import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Pencil,
  Shield,
  Monitor,
  Smartphone,
  Upload,
  Plus,
  Save,
  Lock,
  MessageSquare,
  ChevronRight,
  X,
  Mail,
  Phone,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface SettingsSection {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const sections: SettingsSection[] = [
  {
    id: 'profile',
    icon: User,
    title: 'Profil',
    description: 'Gérez vos informations personnelles'
  },
  {
    id: 'business',
    icon: Building2,
    title: 'Entreprise',
    description: 'Informations de votre entreprise'
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Facturation',
    description: 'Gérez votre abonnement et vos paiements'
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Configurez vos préférences de notifications'
  },
  {
    id: 'security',
    icon: Lock,
    title: 'Sécurité',
    description: 'Gérez vos paramètres de sécurité'
  },
  {
    id: 'alerts',
    icon: AlertTriangle,
    title: 'Alertes',
    description: 'Configurez les seuils et conditions d\'alerte'
  }
];

const SettingsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [emailRecipients, setEmailRecipients] = useState(['contact@example.com']);
  const [phoneRecipients, setPhoneRecipients] = useState(['+33 6 12 34 56 78']);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('15');
  const [timeWindow, setTimeWindow] = useState('30');

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

  const ProfileSection: React.FC = () => {
    const { userProfile, updateProfile } = useUser();
    const [formData, setFormData] = useState(userProfile);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateProfile(formData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const photoUrl = reader.result as string;
          setFormData(prev => ({ ...prev, photoUrl }));
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="relative h-24 w-24">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-700">
              {formData.photoUrl ? (
                <img 
                  src={formData.photoUrl} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-medium">
                  {formData.firstName[0]}
                </div>
              )}
            </div>
            <label 
              htmlFor="photo-upload" 
              className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Photo de profil</h3>
            <p className="text-sm text-gray-400">Cette photo sera affichée sur votre profil</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Prénom</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nom</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    );
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'profile':
        return <ProfileSection />;
      case 'business':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  defaultValue="WeWash Pro"
                  className="w-full px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Numéro SIRET
                </label>
                <input
                  type="text"
                  defaultValue="123 456 789 00012"
                  className="w-full px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse
                </label>
                <textarea
                  rows={3}
                  defaultValue="123 Rue de la Laverie&#10;75000 Paris&#10;France"
                  className="w-full px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  TVA Intracommunautaire
                </label>
                <input
                  type="text"
                  defaultValue="FR 12 345678901"
                  className="w-full px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code NAF
                </label>
                <input
                  type="text"
                  defaultValue="9601A"
                  className="w-full px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-4">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="bg-[#111313] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Plan actuel</h3>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Premium
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">49€</span>
                <span className="text-gray-400">/mois</span>
              </div>
              <p className="text-gray-400 mb-4">
                Facturé mensuellement • Prochain renouvellement le 1er janvier 2024
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Changer de plan
                </button>
                <button className="px-4 py-2 bg-[#2A2D2D] text-white rounded-lg hover:bg-[#353838] transition-colors">
                  Voir les factures
                </button>
              </div>
            </div>

            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Mode de paiement</h3>
              <div className="flex items-center gap-4 p-4 bg-[#1A1D1D] rounded-lg mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC33] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-400">Expire le 12/24</p>
                </div>
                <button className="ml-auto p-2 hover:bg-[#252827] rounded-lg transition-colors">
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A2D2D] text-white rounded-lg hover:bg-[#353838] transition-colors">
                <Plus className="w-4 h-4" />
                Ajouter un mode de paiement
              </button>
            </div>

            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Informations de facturation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse de facturation
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="123 Rue de la Laverie&#10;75000 Paris&#10;France"
                    className="w-full px-4 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email de facturation
                  </label>
                  <input
                    type="email"
                    defaultValue="facturation@wewash.fr"
                    className="w-full px-4 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone de facturation
                  </label>
                  <input
                    type="tel"
                    defaultValue="+33 1 23 45 67 89"
                    className="w-full px-4 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-6">Changer le mot de passe</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-[#1A1D1D] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="pt-2">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4" />
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-6">Double authentification</h3>
              <div className="flex items-center justify-between p-4 bg-[#1A1D1D] rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-400">Sécurisez votre compte avec la 2FA</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Désactivé</span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Activer
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-6">Sessions actives</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1A1D1D] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Windows • Chrome</p>
                      <p className="text-sm text-gray-400">Paris, France • Dernière activité il y a 2 minutes</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full">
                    Actuelle
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1A1D1D] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">iPhone • Safari</p>
                      <p className="text-sm text-gray-400">Lyon, France • Dernière activité hier</p>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300 transition-colors">
                    Déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-6">Notifications par email</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Rapports quotidiens</p>
                    <p className="text-sm text-gray-400">Recevez un résumé quotidien de vos laveries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Alertes de maintenance</p>
                    <p className="text-sm text-gray-400">Soyez notifié des interventions programmées</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Incidents critiques</p>
                    <p className="text-sm text-gray-400">Notifications immédiates en cas d'incident critique</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-6">Notifications SMS</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Incidents critiques</p>
                    <p className="text-sm text-gray-400">Recevez un SMS en cas d'incident critique</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Interventions urgentes</p>
                    <p className="text-sm text-gray-400">Soyez notifié des interventions urgentes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-[#111313] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-6">Notifications push</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Notifications sur le bureau</p>
                    <p className="text-sm text-gray-400">Recevez des notifications sur votre ordinateur</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Son des notifications</p>
                    <p className="text-sm text-gray-400">Jouez un son lors des notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Save className="w-4 h-4" />
                Enregistrer les préférences
              </button>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seuil d'alerte (nombre d'erreurs)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fenêtre de temps (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Destinataires email
              </label>
              <div className="space-y-3">
                {emailRecipients.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-4 py-2 bg-[#111313] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span>{email}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="p-1 hover:bg-[#2A2D2D] rounded-full transition-colors"
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
                    className="flex-1 px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="flex items-center justify-between px-4 py-2 bg-[#111313] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span>{phone}</span>
                    </div>
                    <button
                      onClick={() => handleRemovePhone(phone)}
                      className="p-1 hover:bg-[#2A2D2D] rounded-full transition-colors"
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
                    className="flex-1 px-4 py-2 bg-[#111313] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            Section en cours de développement
          </div>
        );
    }
  };

  return (
    <div className="h-full flex gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-[#1A1D1D] rounded-xl p-4 space-y-2"
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-[#222525]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">{section.title}</div>
                <div className={`text-sm ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                  {section.description}
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeSection && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 bg-[#1A1D1D] rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-gray-400">
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              {activeSection === 'alerts' && (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              )}
            </div>
            {renderSectionContent(activeSection)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsTab;
