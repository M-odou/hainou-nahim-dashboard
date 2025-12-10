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

// Mock Members
const INITIAL_MEMBERS: Member[] = [
  {
    id: '1',
    firstName: 'Amadou',
    lastName: 'Sow',
    phone: '771234567',
    role: Role.DIEUWRIGN,
    gender: Gender.HOMME,
    annualFee: 10000,
    cardNumber: 'DHR-001',
    joinDate: '2023-01-15',
    profession: 'Enseignant',
    photoUrl: 'https://picsum.photos/seed/amadou/200'
  },
  {
    id: '2',
    firstName: 'Fatou',
    lastName: 'Ndiaye',
    phone: '778901234',
    role: Role.DIEUWRIGN_COM_FIN,
    gender: Gender.FEMME,
    annualFee: 10000,
    cardNumber: 'DHR-002',
    joinDate: '2023-02-10',
    profession: 'Comptable',
    photoUrl: 'https://picsum.photos/seed/fatou/200'
  },
  {
    id: '3',
    firstName: 'Ibrahima',
    lastName: 'Fall',
    phone: '762223344',
    role: Role.MEMBRE,
    gender: Gender.HOMME,
    annualFee: 5000,
    cardNumber: 'DHR-003',
    joinDate: '2023-03-05',
    profession: 'Commerçant'
  },
  {
    id: '4',
    firstName: 'Amina',
    lastName: 'Diop',
    phone: '709998877',
    role: Role.DIEUWRIGN_SOKHNA_YI,
    gender: Gender.FEMME,
    annualFee: 7500,
    cardNumber: 'DHR-004',
    joinDate: '2023-04-20',
    profession: 'Infirmière',
    photoUrl: 'https://picsum.photos/seed/amina/200'
  },
  {
    id: '5',
    firstName: 'Moussa',
    lastName: 'Ba',
    phone: '',
    role: Role.MEMBRE,
    gender: Gender.ENFANT,
    annualFee: 2000,
    cardNumber: 'DHR-005',
    joinDate: '2023-06-01',
    guardianName: 'Fatou Ndiaye',
    guardianPhone: '778901234'
  }
];

// Initial Super Admin (Updated to test/test)
const INITIAL_USERS: User[] = [
  {
    id: 'super-admin-1',
    username: 'test',
    password: 'test',
    fullName: 'Super Administrateur',
    role: UserRole.SUPER_ADMIN
  }
];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dahira_user_v3');
    return saved ? JSON.parse(saved) : null;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('dahira_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  
  // Changed key to v3 to force reset to new default user
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dahira_users_v3');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'add' | 'profile' | 'users'>('dashboard');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);

  useEffect(() => {
    localStorage.setItem('dahira_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('dahira_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dahira_user_v3', JSON.stringify(currentUser));
      // Update current user from users list in case it was modified by super admin or self
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
         setCurrentUser(freshUser);
      }
    } else {
      localStorage.removeItem('dahira_user_v3');
    }
  }, [currentUser, users]);

  const handleLogin = (u: string, p: string) => {
    const user = users.find(user => user.username === u && user.password === p);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleAddMember = (member: Member) => {
    if (editingMember) {
      // Update logic
      setMembers(prev => prev.map(m => m.id === member.id ? member : m));
      setEditingMember(null);
      alert("Membre mis à jour avec succès!");
    } else {
      // Create logic
      setMembers(prev => [member, ...prev]);
      alert("Nouveau membre ajouté avec succès!");
    }
    setActiveTab('members');
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setActiveTab('add');
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleCancelForm = () => {
    setEditingMember(null);
    setActiveTab('members');
  };

  // User Management
  const handleSaveUser = (user: User) => {
    if (users.find(u => u.id === user.id)) {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } else {
      setUsers(prev => [...prev, user]);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const existingCardNumbers = members.map(m => m.cardNumber);

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
            onEdit={handleEditClick} 
            onDelete={handleDeleteMember}
            onView={setViewingMember} 
          />
        </div>
      )}

      {activeTab === 'add' && (
        <MemberForm 
          existingMember={editingMember}
          onSave={handleAddMember}
          onCancel={handleCancelForm}
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

      {/* Detail Modal */}
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