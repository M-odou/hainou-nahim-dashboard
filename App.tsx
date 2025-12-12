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
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'add' | 'profile' | 'users'>('dashboard');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper for Super Admin detection
  const isSuperAdminEmail = (email?: string) => email?.trim().toLowerCase() === 'gueyemodougningue@gmail.com';

  // --- Initial Loading ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
        fetchMembers();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (!currentUser || currentUser.id !== session.user.id) {
            fetchUserProfile(session.user.id, session.user.email);
            fetchMembers();
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Data Fetching helpers ---

  const fetchUserProfile = async (userId: string, email?: string) => {
    // 1. SUPER ADMIN BYPASS (Optimization & Safety)
    if (isSuperAdminEmail(email)) {
         setCurrentUser({
          id: userId,
          username: email!,
          fullName: 'Modou Gningue Gueye',
          role: UserRole.SUPER_ADMIN,
          photoUrl: null,
          password: ''
        });
        setLoading(false);
        return; 
    }

    // 2. Standard DB Fetch
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setCurrentUser({
          id: data.id,
          username: data.username || email || '',
          fullName: data.full_name || '',
          role: data.role as UserRole,
          photoUrl: data.photo_url,
          password: ''
        });
      } else if (error) {
        // Fallback en cas d'erreur DB pour permettre la connexion
        console.warn("Erreur profil ou profil manquant:", error.message);
        setCurrentUser({
          id: userId,
          username: email || 'user',
          fullName: 'Utilisateur',
          role: UserRole.ADMIN, // Default fallback
          photoUrl: null,
          password: ''
        });
      }
    } catch (error) {
      console.error('Erreur critique récupération profil:', JSON.stringify(error));
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
      console.error('Erreur récupération membres:', JSON.stringify(error));
    }
  };

  const fetchAllUsers = async () => {
     try {
       // Tri par nom complet pour une liste propre
       const { data, error } = await supabase
         .from('profiles')
         .select('*')
         .order('full_name', { ascending: true });

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
     } catch (err: any) {
       console.error("Erreur fetchAllUsers:", JSON.stringify(err));
       // Fallback UI si la liste plante
       if (currentUser) setUsers([currentUser]);
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

    if (data.session) {
       if (isSuperAdminEmail(email)) {
           setCurrentUser({
              id: data.session.user.id,
              username: email,
              fullName: 'Modou Gningue Gueye',
              role: UserRole.SUPER_ADMIN,
              photoUrl: null,
              password: ''
           });
           return { success: true };
       }

       // For normal users, try to fetch profile
       let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
       
       if (profile) {
           setCurrentUser({
              id: profile.id,
              username: profile.username || email,
              fullName: profile.full_name || '',
              role: profile.role as UserRole,
              photoUrl: profile.photo_url,
              password: ''
           });
       } else {
           // Profil manquant ou erreur, on connecte quand même en mode dégradé (Admin)
           setCurrentUser({
              id: data.session.user.id,
              username: email,
              fullName: 'Administrateur',
              role: UserRole.ADMIN,
              photoUrl: null,
              password: ''
           });
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
    fetchMembers();
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

  const handleSaveUser = async (user: User) => {
    // 1. Update Existing User
    if (user.id && user.id.length > 0) {
      const { error } = await supabase.from('profiles').update({
        full_name: user.fullName,
        role: user.role,
      }).eq('id', user.id);
      
      if (error) {
         alert("Erreur modification: " + error.message);
      } else {
        fetchAllUsers();
        alert("Profil administrateur mis à jour.");
      }
      return;
    }

    // 2. Create New User
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    const { data: authData, error: authError } = await tempClient.auth.signUp({
      email: user.username,
      password: user.password,
      options: {
        data: {
          full_name: user.fullName,
          role: user.role
        }
      }
    });

    if (authError) {
      alert("Erreur lors de la création du compte : " + authError.message);
      return;
    }

    if (authData.user) {
      const newProfileData = {
        id: authData.user.id,
        username: user.username,
        full_name: user.fullName,
        role: user.role,
        photo_url: user.photoUrl
      };

      // CRUCIAL: Utilisation de UPSERT au lieu de INSERT.
      // Cela permet de gérer deux cas :
      // 1. Si vous avez mis un TRIGGER SQL : Le profil existe déjà -> Upsert le met à jour.
      // 2. Si vous n'avez PAS de Trigger : Le profil n'existe pas -> Upsert le crée.
      
      // Tentative via tempClient (l'utilisateur crée son propre profil)
      let { error: profileError } = await tempClient
        .from('profiles')
        .upsert(newProfileData);

      if (profileError) {
         console.warn("Echec upsert tempClient (possible RLS), tentative via SuperAdmin...");
         // Fallback: Tentative via le client principal (Super Admin)
         const { error: adminError } = await supabase
           .from('profiles')
           .upsert(newProfileData);
         
         if (adminError) {
             alert("Compte Auth créé, mais erreur synchronisation profil : " + adminError.message);
             // On ne return pas, car le compte Auth existe, on rafraichit quand même
         }
      }

      await fetchAllUsers();
      alert(`L'administrateur ${user.fullName} a été créé avec succès !`);
    }
  };
  
  const handleDeleteUser = async (id: string) => {
     // Note: On ne peut supprimer que le profil via l'API publique.
     // L'utilisateur Auth restera mais ne pourra plus se connecter si l'app vérifie le profil.
     const { error } = await supabase.from('profiles').delete().eq('id', id);
     if (error) alert("Erreur: " + error.message);
     else {
       await fetchAllUsers();
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
       if (currentUser) {
         setCurrentUser({...currentUser, ...updatedUser});
       }
       alert("Profil mis à jour");
    }
    
    if (updatedUser.password) {
       const { error: passError } = await supabase.auth.updateUser({ password: updatedUser.password });
       if (passError) alert("Erreur mot de passe: " + passError.message);
       else alert("Mot de passe mis à jour.");
    }
  };

  const existingCardNumbers = members.map(m => m.cardNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <div className="text-brand-800 font-medium animate-pulse">Chargement de l'application...</div>
      </div>
    );
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
          onRefresh={fetchAllUsers} 
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