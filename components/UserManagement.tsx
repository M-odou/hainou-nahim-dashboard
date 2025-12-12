import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Trash2, Edit2, Shield, UserPlus, Save, X, RefreshCw, Mail, Lock } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onRefresh?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onSaveUser, onDeleteUser, onRefresh }) => {
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsFormOpen(true);
    setError(null);
  };

  const handleCreate = () => {
    setEditingUser({
      role: UserRole.ADMIN,
      fullName: '',
      username: '',
      password: ''
    });
    setIsFormOpen(true);
    setError(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur ${name} ?\nCette action est irréversible.`)) {
      onDeleteUser(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.username || !editingUser?.fullName) {
      setError("L'email et le nom complet sont requis.");
      return;
    }
    
    // Check for duplicate username (if creating)
    if (!editingUser.id) {
        const duplicate = users.find(u => u.username === editingUser.username);
        if (duplicate) {
          setError("Cet email est déjà utilisé par un autre administrateur.");
          return;
        }
    }

    if (!editingUser.id && !editingUser.password) {
      setError("Le mot de passe est requis pour un nouvel utilisateur.");
      return;
    }

    if (!editingUser.username?.includes('@')) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    onSaveUser({
      id: editingUser.id || '', 
      username: editingUser.username,
      fullName: editingUser.fullName,
      role: editingUser.role as UserRole,
      password: editingUser.password || '', 
      photoUrl: editingUser.photoUrl
    } as User);
    
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion des Accès</h2>
          <p className="text-slate-500">
            {users.length} compte{users.length > 1 ? 's' : ''} administrateur{users.length > 1 ? 's' : ''} actif{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
           {onRefresh && (
             <button 
               onClick={onRefresh}
               className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
               title="Actualiser la liste"
             >
               <RefreshCw size={18} />
             </button>
           )}
           <button 
             onClick={handleCreate}
             className="px-4 py-2 bg-brand-600 text-white rounded-lg shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium"
           >
             <UserPlus size={18} />
             Nouvel Admin
           </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield size={20} className="text-brand-600" />
              {editingUser?.id ? 'Modifier Utilisateur' : 'Créer un Compte Admin'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
         
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                <Shield size={14} />
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Nom complet *</label>
                <input 
                  type="text" 
                  value={editingUser?.fullName || ''}
                  onChange={e => setEditingUser(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                  placeholder="Ex: Moussa Diop"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Email (Connexion) *
                </label>
                <div className="relative">
                  {editingUser?.id ? (
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  ) : (
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  )}
                  <input 
                    type="email" 
                    value={editingUser?.username || ''}
                    onChange={e => setEditingUser(prev => ({...prev, username: e.target.value}))}
                    className={`w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none ${
                        editingUser?.id 
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                        : 'bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500'
                    }`}
                    placeholder="nom@exemple.com"
                    disabled={!!editingUser?.id}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Rôle</label>
                <select 
                  value={editingUser?.role}
                  onChange={e => setEditingUser(prev => ({...prev, role: e.target.value as UserRole}))}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none"
                >
                  <option value={UserRole.ADMIN}>Administrateur</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  {editingUser?.id ? 'Réinitialiser mot de passe (Laisser vide pour conserver)' : 'Mot de passe *'}
                </label>
                <input 
                  type="password" 
                  value={editingUser?.password || ''}
                  onChange={e => setEditingUser(prev => ({...prev, password: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none"
                  placeholder={editingUser?.id ? "••••••••" : "Créer un mot de passe"}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Save size={18} /> 
                {editingUser?.id ? 'Mettre à jour' : 'Créer le compte'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
             Aucun administrateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email (ID)</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden border-2 flex-shrink-0 ${
                            user.role === UserRole.SUPER_ADMIN ? 'border-purple-200 bg-purple-100 text-purple-700' : 'border-slate-100 bg-slate-100 text-slate-600'
                        }`}>
                          {user.photoUrl ? (
                            <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                            <div className="font-medium text-slate-800 flex items-center gap-2">
                                {user.fullName}
                                {user.id === currentUser.id && (
                                    <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold border border-brand-200">Vous</span>
                                )}
                            </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === UserRole.SUPER_ADMIN 
                          ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-mono">
                      {user.username}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="Modifier les infos"
                        >
                          <Edit2 size={16} />
                        </button>
                        {user.id !== currentUser.id && (
                          <button 
                            onClick={() => handleDelete(user.id, user.fullName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};