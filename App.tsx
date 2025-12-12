import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { MemberTable } from './components/MemberTable';
import { MemberForm } from './components/MemberForm';
import { MemberDetailModal } from './components/MemberDetailModal';
import { UserManagement } from './components/UserManagement';
import { Profile } from './components/Profile';
import { Member, Role, Gender, User, UserRole } from './types';
import { supabase, supabaseUrl, supabaseAnonKey } from './lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]); // This would ideally come from a profiles table
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'add' | 'profile' | 'users'>('dashboard');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Initial Loading ---
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
        fetchMembers();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
        fetchMembers();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Data Fetching helpers ---

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile from 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentUser({
          id: data.id,
          username: data.username || '', // maps to email
          fullName: data.full_name || '',
          role: data.role as UserRole,
          photoUrl: data.photo_url,
          password: '' // Password is handled by Auth, not stored here
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't alert here to avoid spamming on page load, but login will catch it
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedMembers: Member[] = data.map(m => ({
          id: m.id,
          firstName: m.first_name,
          lastName: m.last_name,
          phone: m.phone || '',
          role: m.role as Role,
          gender: m.gender as Gender,
          annualFee: Number(m.annual_fee),
          cardNumber: m.card_number,
          joinDate: m.join_date,
          profession: m.profession,
          guardianName: m.guardian_name,
          guardianPhone: m.guardian_phone,
          photoUrl: m.photo_url
        }));
        setMembers(mappedMembers);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Erreur lors du chargement des membres');
    }
  };

  const fetchAllUsers = async () => {
     // This fetch is for the "User Management" tab (Super Admin)
     try {
       const { data, error } = await supabase.from('profiles').select('*');
       if (error) throw error;
       if (data) {
          const mappedUsers: User[] = data.map(u => ({
            id: u.id,
            username: u.username || 'user',
            fullName: u.full_name,
            role: u.role as UserRole,
            photoUrl: u.photo_url,
            password: ''
          }));
          setUsers(mappedUsers);
       }
     } catch (err) {
       console.error(err);
     }
  };

  useEffect(() => {
    if (activeTab === 'users' && currentUser?.role === UserRole.SUPER_ADMIN) {
      fetchAllUsers();
    }
  }, [activeTab, currentUser]);


  // --- Actions ---

  const handleLogin = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // VERIFICATION DU PROFIL : On vérifie immédiatement si le profil existe
    // Cela évite que l'utilisateur soit connecté (Auth) mais bloqué sur l'écran de login (App)
    if (data.session) {
       const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
        
       if (profileError || !profile) {
         await supabase.auth.signOut();
         console.error("Login Error: Profile not found", profileError);
         return { success: false, error: "Connexion réussie mais profil introuvable. Veuillez contacter le support technique." };
       }
    }

    return { success: true };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMembers([]);
    setActiveTab('dashboard');
  };

  const handleAddMember = async (member: Member) => {
    // Map to DB columns
    const dbMember = {
      first_name: member.firstName,
      last_name: member.lastName,
      phone: member.phone,
      role: member.role,
      gender: member.gender,
      annual_fee: member.annualFee,
      card_number: member.cardNumber,
      join_date: member.joinDate,
      profession: member.profession,
      guardian_name: member.guardianName,
      guardian_phone: member.guardianPhone,
      photo_url: member.photoUrl
    };

    if (editingMember) {
      // Update
      const { error } = await supabase
        .from('members')
        .update(dbMember)
        .eq('id', editingMember.id);

      if (error) {
        alert('Erreur lors de la mise à jour: ' + error.message);
        return;
      }
      alert('Membre mis à jour !');
    } else {
      // Create
      const { error } = await supabase
        .from('members')
        .insert([dbMember]);
      
      if (error) {
        alert("Erreur lors de l'ajout: " + error.message);
        return;
      }
      alert('Nouveau membre ajouté !');
    }

    setEditingMember(null);
    fetchMembers(); // Refresh list
    setActiveTab('members');
  };

  const handleDeleteMember = async (id: string) => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      alert("Erreur: " + error.message);
    } else {
      fetchMembers();
    }
  };

  // User Management
  const handleSaveUser = async (user: User) => {
    if (user.id && user.id.length > 0) {
      // --- MODIFICATION D'UN ADMIN EXISTANT ---
      const { error } = await supabase.from('profiles').update({
        full_name: user.fullName,
        role: user.role,
        // username: user.username, // NE PAS METTRE À JOUR L'EMAIL (USERNAME) pour éviter desync avec Auth
      }).eq('id', user.id);
      
      if (error) alert("Erreur modification: " + error.message);
      else {
        fetchAllUsers();
        alert("Profil administrateur mis à jour.");
      }
    } else {
      // --- CRÉATION D'UN NOUVEL ADMIN ---
      
      // 1. On utilise un client temporaire pour ne PAS déconnecter le Super Admin actuel
      // car supabase.auth.signUp connecte automatiquement l'utilisateur.
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false, // Important : ne pas stocker la session dans le navigateur
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      // 2. Création du compte dans Supabase Auth
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: user.username,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName
          }
        }
      });

      if (authError) {
        alert("Erreur lors de la création du compte : " + authError.message);
        return;
      }

      if (authData.user) {
        // 3. Création de l'entrée dans la table 'profiles'
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          username: user.username,
          full_name: user.fullName,
          role: user.role,
          photo_url: user.photoUrl
        });

        if (profileError) {
          alert("Compte Auth créé mais erreur profil : " + profileError.message);
        } else {
          fetchAllUsers();
          alert(`L'administrateur ${user.fullName} a été créé avec succès !`);
        }
      }
    }
  };
  
  const handleDeleteUser = async (id: string) => {
     // Note : Supprimer le profil ne supprime pas le compte Auth sans Cloud Function.
     // Pour cette démo, on supprime le profil, ce qui révoque l'accès aux données.
     const { error } = await supabase.from('profiles').delete().eq('id', id);
     if (error) alert("Erreur: " + error.message);
     else {
       fetchAllUsers();
       alert("L'accès de l'administrateur a été révoqué.");
     }
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    const { error } = await supabase.from('profiles').update({
       full_name: updatedUser.fullName,
       photo_url: updatedUser.photoUrl
    }).eq('id', currentUser?.id);

    if (error) {
       alert("Erreur: " + error.message);
    } else {
       // Refresh local state
       if (currentUser) {
         setCurrentUser({...currentUser, ...updatedUser});
       }
       alert("Profil mis à jour");
    }
    
    // Modification du mot de passe de l'utilisateur COURANT
    if (updatedUser.password) {
       const { error: passError } = await supabase.auth.updateUser({ password: updatedUser.password });
       if (passError) alert("Erreur mot de passe: " + passError.message);
       else alert("Mot de passe mis à jour.");
    }
  };

  const existingCardNumbers = members.map(m => m.cardNumber);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-brand-600 animate-pulse">Chargement de l'application...</div>;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onNavigate={(tab) => {
        setActiveTab(tab);
        if (tab !== 'add') setEditingMember(null);
      }}
      onLogout={handleLogout}
      currentUser={currentUser}
    >
      {activeTab === 'dashboard' && <Dashboard members={members} />}
      
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Base de Données</h2>
            <button 
              onClick={() => setActiveTab('add')}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg shadow-sm hover:bg-brand-700 transition-colors text-sm font-medium"
            >
              + Nouveau Membre
            </button>
          </div>
          <MemberTable 
            members={members} 
            onEdit={(m) => {
              setEditingMember(m);
              setActiveTab('add');
            }} 
            onDelete={handleDeleteMember}
            onView={setViewingMember} 
          />
        </div>
      )}

      {activeTab === 'add' && (
        <MemberForm 
          existingMember={editingMember}
          onSave={handleAddMember}
          onCancel={() => {
            setEditingMember(null);
            setActiveTab('members');
          }}
          existingCardNumbers={existingCardNumbers}
        />
      )}

      {activeTab === 'users' && currentUser.role === UserRole.SUPER_ADMIN && (
        <UserManagement 
          users={users} 
          currentUser={currentUser} 
          onSaveUser={handleSaveUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeTab === 'profile' && (
        <Profile 
          currentUser={currentUser} 
          onUpdateProfile={handleUpdateProfile} 
        />
      )}

      {viewingMember && (
        <MemberDetailModal 
          member={viewingMember} 
          onClose={() => setViewingMember(null)} 
        />
      )}
    </Layout>
  );
}

export default App;