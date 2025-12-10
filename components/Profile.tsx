import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Save, Upload, User as UserIcon, Lock, Camera } from 'lucide-react';

interface ProfileProps {
  currentUser: User;
  onUpdateProfile: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateProfile }) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: "Les mots de passe ne correspondent pas." });
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      fullName,
      photoUrl,
      // Only update password if provided
      password: password ? password : currentUser.password
    };

    onUpdateProfile(updatedUser);
    setMessage({ type: 'success', text: "Profil mis à jour avec succès !" });
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Mon Profil</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-brand-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} className="text-slate-400" />
                  )}
                </div>
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-slate-600 shadow-md hover:text-brand-600 transition-colors border border-slate-100"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-16 pb-8 px-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <UserIcon size={16} /> Informations
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nom Complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Identifiant</label>
                <input
                  type="text"
                  value={currentUser.username}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">L'identifiant ne peut pas être modifié.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Lock size={16} /> Sécurité
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Confirmer mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};