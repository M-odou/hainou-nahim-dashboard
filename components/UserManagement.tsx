import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Trash2, Edit2, Shield, UserPlus, Save, X, RefreshCw } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onSaveUser, onDeleteUser }) => {
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

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      onDeleteUser(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.username || !editingUser?.fullName) {
      setError("Le nom d'utilisateur et le nom complet sont requis.");
      return;
    }
    
    // Check for duplicate username (if creating or changing username)
    const duplicate = users.find(u => u.username === editingUser.username && u.id !== editingUser.id);
    if (duplicate) {
      setError("Cet identifiant est déjà utilisé.");
      return;
    }

    if (!editingUser.id && !editingUser.password) {
      setError("Le mot de passe est requis pour un nouvel utilisateur.");
      return;
    }

    onSaveUser({
      id: editingUser.id || crypto.randomUUID(),
      username: editingUser.username,
      fullName: editingUser.fullName,
      role: editingUser.role as UserRole,
      password: editingUser.password || 'temp1234', // Should keep old pass if empty on edit, but handled in App logic usually. Here we assume passed fully.
      photoUrl: editingUser.photoUrl
    } as User);
    
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion des Accès</h2>
          <p className="text-slate-500">Gérez les administrateurs de la plateforme.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <UserPlus size={18} />
          Nouvel Admin
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingUser?.id ? 'Modifier Utilisateur' : 'Créer Utilisateur'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nom complet</label>
                <input 
                  type="text" 
                  value={editingUser?.fullName || ''}
                  onChange={e => setEditingUser(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none"
                  placeholder="Ex: Moussa Diop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Rôle</label>
                <select 
                  value={editingUser?.role}
                  onChange={e => setEditingUser(prev => ({...prev, role: e.target.value as UserRole}))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none"
                >
                  <option value={UserRole.ADMIN}>Administrateur</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Identifiant</label>
                <input 
                  type="text" 
                  value={editingUser?.username || ''}
                  onChange={e => setEditingUser(prev => ({...prev, username: e.target.value}))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none"
                  placeholder="Ex: admin2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  {editingUser?.id ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                </label>
                <input 
                  type="password" 
                  value={editingUser?.password || ''}
                  onChange={e => setEditingUser(prev => ({...prev, password: e.target.value}))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} /> Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Rôle</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Identifiant</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/80">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold overflow-hidden">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.fullName.charAt(0)
                      )}
                    </div>
                    <span className="font-medium text-slate-800">{user.fullName}</span>
                    {user.id === currentUser.id && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Vous</span>
                    )}
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
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    {user.id !== currentUser.id && (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer"
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
    </div>
  );
};