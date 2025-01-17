import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Wrench,
  MapPin,
  UserPlus,
  Briefcase,
  Phone,
  Mail,
  Building,
  GraduationCap,
  X,
  Plus,
  Minus,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../lib/types';

type Technician = Database['public']['Tables']['technicians']['Row'];

const Technicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartner, setNewPartner] = useState<Technician>({
    name: '',
    email: '',
    phone: '',
    type: '',
    company_name: '',
    service_area: '',
    speciality: ''
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const { data: technicians, error } = await supabase
        .from('technicians')
        .select('*');

      if (error) throw error;

      setTechnicians(technicians || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des techniciens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const partnerData: Technician = {
        owner_id: user.id,
        name: newPartner.name,
        email: newPartner.email,
        phone: newPartner.phone,
        type: newPartner.type,
        company_name: newPartner.company_name || null,
        service_area: newPartner.service_area,
        speciality: newPartner.speciality
      };

      const { error } = await supabase
        .from('technicians')
        .insert([partnerData]);

      if (error) throw error;

      setShowAddModal(false);
      fetchTechnicians();

    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] p-6 flex items-center justify-center">
        <div className="text-[#286BD4] text-lg">Chargement des partenaires...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[#F9F9F9] p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* En-tête */}
      <motion.div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#286BD4] tracking-tight">
            Réseau de techniciens
          </h1>
          <p className="text-[#286BD4]/60 mt-1 md:mt-2 text-base md:text-lg">
            Nos partenaires techniques
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#286BD4] text-white hover:bg-[#286BD4]/90 px-4 py-2 rounded-lg transition-all font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Ajouter un partenaire
        </button>
      </motion.div>

      {/* Liste des partenaires */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
        {technicians.map((technician) => (
          <motion.div
            key={technician.id}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
            variants={itemVariants}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#286BD4]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-[#286BD4]" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-[#1a1a1a] font-medium text-lg">
                      {technician.name}
                    </h3>
                    <p className="text-[#666666]">
                      {technician.company_name || "Indépendant"}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    technician.type === 'Expert' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    {technician.type}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#286BD4]" />
                    <span className="text-[#666666]">
                      {technician.service_area}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-[#286BD4]" />
                    <span className="text-[#666666]">
                      {technician.speciality}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${technician.phone}`;
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#286BD4] text-white rounded-xl text-sm font-medium hover:bg-[#286BD4]/90 transition-colors flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${technician.email}`;
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#286BD4]/10 text-[#286BD4] rounded-xl text-sm font-medium hover:bg-[#286BD4]/20 transition-colors flex-1"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#286BD4]/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#286BD4]">Ajouter un partenaire</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddPartner} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#286BD4]/70 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#286BD4] focus:ring-1 focus:ring-[#286BD4] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#286BD4]/70 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#286BD4] focus:ring-1 focus:ring-[#286BD4] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#286BD4]/70 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#286BD4] focus:ring-1 focus:ring-[#286BD4] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#286BD4]/70 mb-2">
                    Type
                  </label>
                  <select
                    required
                    value={newPartner.type}
                    onChange={(e) => setNewPartner({ ...newPartner, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#286BD4] focus:ring-1 focus:ring-[#286BD4] outline-none transition-colors"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="Expert">Expert</option>
                    <option value="Partenaire">Partenaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#286BD4]/70 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={newPartner.company_name || ''}
                  onChange={(e) => setNewPartner({ ...newPartner, company_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#286BD4] focus:ring-1 focus:ring-[#286BD4] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#286BD4]/70 mb-2">
                  Zone d'intervention
                </label>
                <input
                  type="text"
                  required
                  value={newPartner.service_area}
                  onChange={(e) => setNewPartner({ ...newPartner, service_area: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#286BD4] focus:ring-1 focus:ring-[#286BD4] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#286BD4]/70 mb-2">
                  Spécialité
                </label>
                <input
                  type="text"
                  required
                  value={newPartner.speciality}
                  onChange={(e) => setNewPartner({ ...newPartner, speciality: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#286BD4] focus:ring-1 focus:ring-[#286BD4] outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 text-[#286BD4] hover:bg-[#286BD4]/5 rounded-xl transition-colors font-medium bg-[#286BD4]/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#286BD4] text-white hover:bg-[#286BD4]/90 rounded-xl transition-colors font-medium"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Technicians;
