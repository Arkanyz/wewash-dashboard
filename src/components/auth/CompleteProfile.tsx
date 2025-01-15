import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface CompleteProfileProps {
  userId: string;
  email: string;
}

export default function CompleteProfile({ userId, email }: CompleteProfileProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Informations personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Informations professionnelles
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [vatNumber, setVatNumber] = useState('');

  // Adresse
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('France');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mise à jour du profil dans Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          company_name: companyName,
          siret_number: siret,
          vat_number: vatNumber,
          address: address,
          city: city,
          postal_code: postalCode,
          country: country,
          email: email,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Redirection vers le tableau de bord
      navigate('/dashboard');
    } catch (err) {
      setError("Une erreur est survenue lors de la mise à jour de votre profil. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1E90FF] via-white to-[#F0F8FF]">
      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#1E90FF]/20 via-[#1E90FF]/10 to-[#F0F8FF]/20 rounded-[34px] blur-2xl"></div>
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_8px_40px_rgba(30,144,255,0.12)] p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E90FF]/5 via-white/50 to-[#1E90FF]/5 opacity-50 rounded-[32px] pointer-events-none"></div>

          <h2 className="text-2xl font-bold text-center mb-4 text-[#1E90FF]">
            Complétez votre profil WeWash Pro
          </h2>
          <p className="text-center text-[#4A5568] mb-8">
            Ces informations nous permettront de mieux vous accompagner
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/50 backdrop-blur-sm text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="bg-[#F8FAFC] p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-[#2D3748] mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#2D3748] mb-1">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#2D3748] mb-1">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#2D3748] mb-1">
                  Numéro de téléphone
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                  required
                />
              </div>
            </div>

            {/* Informations professionnelles */}
            <div className="bg-[#F8FAFC] p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-[#2D3748] mb-4">Informations professionnelles</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-[#2D3748] mb-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="siret" className="block text-sm font-medium text-[#2D3748] mb-1">
                    Numéro SIRET
                  </label>
                  <input
                    id="siret"
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="vatNumber" className="block text-sm font-medium text-[#2D3748] mb-1">
                    Numéro de TVA
                  </label>
                  <input
                    id="vatNumber"
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-[#F8FAFC] p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-[#2D3748] mb-4">Adresse de l'entreprise</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-[#2D3748] mb-1">
                    Adresse
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-[#2D3748] mb-1">
                      Ville
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-[#2D3748] mb-1">
                      Code postal
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-[#2D3748] mb-1">
                    Pays
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                    required
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1E90FF] to-[#157AFF] text-white py-3 px-4 rounded-xl hover:from-[#157AFF] hover:to-[#1E90FF] transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#1E90FF]/20 flex items-center justify-center space-x-2"
            >
              <span>Finaliser mon inscription</span>
              {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
