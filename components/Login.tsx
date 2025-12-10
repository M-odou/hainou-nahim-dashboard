import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulation de délai réseau
    setTimeout(() => {
        const success = onLogin(username, password);
        if (success) {
            // Login successful, parent handles redirection
        } else {
            setError('Identifiant ou mot de passe incorrect');
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-brand-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hainou Nahim</h1>
          <p className="text-brand-100 mt-2 text-sm font-light">
            Espace de gestion numérique
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100 animate-in shake">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 ml-1">Identifiant</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all duration-300 placeholder:text-slate-300"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all duration-300 placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-brand-600/30 flex items-center justify-center mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
             Contactez le Super Admin pour obtenir un accès.
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">© 2026 Hainou Nahim digital</p>
        </div>
      </div>
    </div>
  );
};