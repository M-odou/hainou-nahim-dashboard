import React from 'react';
import { LayoutDashboard, Users, Menu, X, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'members' | 'add' | 'profile' | 'users';
  onNavigate: (tab: 'dashboard' | 'members' | 'add' | 'profile' | 'users') => void;
  onLogout: () => void;
  currentUser: User;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, onLogout, currentUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ tab, icon: Icon, label }: { tab: 'dashboard' | 'members' | 'add' | 'profile' | 'users', icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        activeTab === tab || (tab === 'members' && activeTab === 'add')
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-brand-800">Hainou Nahim</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-brand-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-sm">HN</div>
            Hainou Nahim
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gestion Dahira</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Tableau de bord" />
          <NavItem tab="members" icon={Users} label="Membres" />
          
          {currentUser.role === UserRole.SUPER_ADMIN && (
             <>
               <div className="my-2 border-t border-slate-100"></div>
               <NavItem tab="users" icon={ShieldCheck} label="Gestion Accès" />
             </>
          )}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100 bg-slate-50">
          <button 
             onClick={() => onNavigate('profile')}
             className="flex items-center gap-3 mb-4 w-full text-left hover:bg-slate-100 p-2 rounded-lg transition-colors -ml-2"
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold overflow-hidden">
               {currentUser.photoUrl ? (
                 <img src={currentUser.photoUrl} alt="" className="w-full h-full object-cover" />
               ) : (
                 currentUser.fullName.charAt(0)
               )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{currentUser.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
            </div>
            <UserCircle size={16} className="text-slate-400" />
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm px-2"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};