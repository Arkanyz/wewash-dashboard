import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useSupabase } from '../../providers/SupabaseProvider';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        }
        throw error;
      }

      if (data.user) {
        // Rediriger vers la page précédente ou le dashboard par défaut
        const state = location.state as { from?: string };
        const from = state?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/complete-profile`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la connexion avec Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1E90FF] via-white to-[#F0F8FF]">
      {/* Texture de fond avec motif subtil */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIi8+CiAgPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMC41IiBmaWxsPSIjMUU5MEZGIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-40"></div>
      
      {/* Effet de lumière premium */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-[#1E90FF]/10 via-transparent to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-[#F0F8FF]/20 mix-blend-overlay"></div>
      </div>

      {/* Effet de grain moderne */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjAyIi8+Cjwvc3ZnPg==')] opacity-20 mix-blend-overlay"></div>

      {/* Effet de vignette subtil */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5"></div>

      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1E90FF]/5 to-transparent animate-shimmer"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#1E90FF]/20 via-[#1E90FF]/10 to-[#F0F8FF]/20 rounded-[34px] blur-2xl"></div>
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_8px_40px_rgba(30,144,255,0.12)] p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E90FF]/5 via-white/50 to-[#1E90FF]/5 opacity-50 rounded-[32px] pointer-events-none"></div>
          <h2 className="text-2xl font-bold text-center mb-4 text-[#1E90FF]">
            Bienvenue sur WeWash Pro
          </h2>
          <p className="text-center text-[#4A5568] mb-8">
            Gérez votre laverie en toute simplicité
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2D3748] mb-1">
                Adresse e-mail professionnelle
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                placeholder="exemple@wewash.fr"
                style={{ color: '#2D3748' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2D3748] mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] bg-white/50 transition-colors text-[#2D3748]"
                  placeholder="Votre mot de passe"
                  style={{ color: '#2D3748' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-500 transition-colors duration-200 focus:outline-none"
                  style={{ background: 'none', border: 'none' }}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#1E90FF] hover:text-[#157AFF] transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1E90FF] to-[#157AFF] text-white py-3 px-4 rounded-xl hover:from-[#157AFF] hover:to-[#1E90FF] transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#1E90FF]/20 flex items-center justify-center space-x-2"
            >
              <span>Se connecter</span>
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#4A5568]">ou</span>
              </div>
            </div>

            <div className="text-center text-sm text-[#4A5568]">
              Pas encore de compte WeWash Pro ?{' '}
              <Link to="/register" className="text-[#1E90FF] hover:text-[#157AFF] font-medium transition-colors">
                Créer un compte professionnel
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
