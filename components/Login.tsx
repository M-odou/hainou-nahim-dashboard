import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

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

    // Simulation de délai réseau pour voir l'animation de chargement
    setTimeout(() => {
        const success = onLogin(username, password);
        if (success) {
            // Login successful
        } else {
            setError('Identifiant ou mot de passe incorrect');
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in-up border border-white/50 backdrop-blur-sm">
        <div className="bg-brand-600 p-8 text-center relative overflow-hidden">
          {/* Decorative pattern on header */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="relative z-10 animate-float">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 shadow-lg">
              <Lock className="text-white drop-shadow-md" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight relative z-10 drop-shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Hainou Nahim
          </h1>
          <p className="text-brand-100 mt-2 text-sm font-light relative z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Espace de gestion numérique
          </p>
        </div>

        <div className="p-8">
          {/* Demo Credentials Box */}
          <div 
            className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-sm text-blue-800 text-center shadow-sm animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="font-medium mb-1 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Identifiants de démonstration
            </p>
            <div className="flex justify-center gap-4 text-xs mt-1 bg-white/50 py-1 rounded border border-blue-100/50">
               <p>ID: <span className="font-mono font-bold text-brand-700">test</span></p>
               <p>Pass: <span className="font-mono font-bold text-brand-700">test</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100 animate-shake shadow-sm flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}
            
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
              <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">Identifiant</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors duration-300">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all duration-300 placeholder:text-slate-300 shadow-sm"
                  placeholder="Ex: test"
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.6s', opacity: 0 }}>
              <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">Mot de passe</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors duration-300">
                   <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all duration-300 placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Se connecter 
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
             <p className="text-xs text-slate-400">
               Problème de connexion ? <span className="text-brand-600 font-medium cursor-pointer hover:underline">Contactez le support</span>
             </p>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            © 2026 Hainou Nahim digital
          </p>
        </div>
      </div>
    </div>
  );
};